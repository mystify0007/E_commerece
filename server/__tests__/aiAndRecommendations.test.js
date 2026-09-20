import request from "supertest";
import app from "../app.js";

async function createAdmin() {
  const { User } = await import("../models/User.js");
  const passwordHash = await User.hashPassword("adminpass123");
  const admin = await User.create({ name: "Admin", email: "admin@example.com", passwordHash, role: "admin" });
  const { issueTokens } = await import("../services/authService.js");
  return issueTokens(admin);
}

async function registerAndLogin(overrides = {}) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test User", email: "user@example.com", password: "password123", ...overrides });
  return res.body.data;
}

async function approveArtisan(email) {
  const admin = await createAdmin();
  const artisanAuth = await registerAndLogin({ email, role: "artisan" });
  const { Artisan } = await import("../models/Artisan.js");
  const profile = await Artisan.findOne({ user: artisanAuth.user._id });
  await request(app)
    .patch(`/api/artisans/${profile._id}/verify`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ status: "approved" });
  return { admin, artisanAuth };
}

async function createApprovedProduct(admin, artisanAuth, overrides = {}) {
  const categoryRes = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ name: overrides.categoryName || `Category-${Date.now()}-${Math.random()}` });

  const productRes = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
    .send({
      category: categoryRes.body.data._id,
      name: overrides.name || "Leather Boot",
      description: "A handcrafted product for testing.",
      material: overrides.material || "Leather",
      colors: overrides.colors || ["brown"],
      sizesAvailable: [40, 41, 42],
      price: overrides.price || 3000,
      stock: 10,
      images: ["https://example.com/image.jpg"],
    });

  await request(app)
    .patch(`/api/products/${productRes.body.data._id}/moderate`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ action: "approve" });

  return { productId: productRes.body.data._id, categoryId: categoryRes.body.data._id };
}

describe("Wishlist", () => {
  test("add, list, and remove", async () => {
    const { admin, artisanAuth } = await approveArtisan("artisan@example.com");
    const { productId } = await createApprovedProduct(admin, artisanAuth);
    const customer = await registerAndLogin({ email: "customer@example.com" });

    const addRes = await request(app)
      .post(`/api/wishlist/${productId}`)
      .set("Authorization", `Bearer ${customer.accessToken}`);
    expect(addRes.status).toBe(201);
    expect(addRes.body.data.items).toHaveLength(1);

    const getRes = await request(app).get("/api/wishlist").set("Authorization", `Bearer ${customer.accessToken}`);
    expect(getRes.body.data.items).toHaveLength(1);
    expect(getRes.body.data.items[0].product.name).toBe("Leather Boot");

    const removeRes = await request(app)
      .delete(`/api/wishlist/${productId}`)
      .set("Authorization", `Bearer ${customer.accessToken}`);
    expect(removeRes.body.data.items).toHaveLength(0);
  });
});

describe("Recommendations", () => {
  test("a customer with no history gets popular products as a fallback", async () => {
    const { admin, artisanAuth } = await approveArtisan("artisan@example.com");
    await createApprovedProduct(admin, artisanAuth, { name: "Popular Boot" });
    const customer = await registerAndLogin({ email: "customer@example.com" });

    const res = await request(app).get("/api/recommendations/for-you").set("Authorization", `Bearer ${customer.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("purchase history biases recommendations toward the same category/material", async () => {
    const { admin, artisanAuth } = await approveArtisan("artisan@example.com");
    const { productId: purchasedId, categoryId } = await createApprovedProduct(admin, artisanAuth, {
      name: "Brown Leather Boot",
      material: "Leather",
      colors: ["brown"],
    });
    // An unrelated product in a different category/material should rank lower.
    await createApprovedProduct(admin, artisanAuth, {
      name: "White Canvas Sandal",
      material: "Canvas",
      colors: ["white"],
      categoryName: `Unrelated-${Date.now()}`,
    });
    // A similar product in the same category/material should rank higher.
    const similarRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({
        category: categoryId,
        name: "Tan Leather Boot",
        description: "Another handcrafted leather boot.",
        material: "Leather",
        colors: ["brown"],
        sizesAvailable: [41],
        price: 3200,
        stock: 5,
        images: ["https://example.com/image2.jpg"],
      });
    await request(app)
      .patch(`/api/products/${similarRes.body.data._id}/moderate`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ action: "approve" });

    const customer = await registerAndLogin({ email: "customer@example.com" });
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ product: purchasedId, quantity: 1, size: 41, color: "brown" });
    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({
        shippingAddress: { fullName: "Sita Gurung", phone: "9800000000", line1: "Thamel", city: "Kathmandu" },
        paymentProvider: "cod",
      });

    const res = await request(app)
      .get("/api/recommendations/for-you")
      .set("Authorization", `Bearer ${customer.accessToken}`);
    expect(res.status).toBe(200);
    const names = res.body.data.map((p) => p.name);
    expect(names).toContain("Tan Leather Boot");
    expect(names).not.toContain("Brown Leather Boot"); // already purchased, excluded
  });
});

describe("AI product assistant", () => {
  test("suggests category, material, color, and tags from free text", async () => {
    const { admin, artisanAuth } = await approveArtisan("artisan@example.com");
    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ name: "Boots" });

    const res = await request(app)
      .post("/api/ai/product-assist")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ name: "Brown Leather Boot", description: "A rugged brown leather boot with a thick rubber sole." });

    expect(res.status).toBe(200);
    expect(res.body.data.suggestedCategory.name).toBe("Boots");
    expect(res.body.data.suggestedMaterial).toBe("leather");
    expect(res.body.data.suggestedColors).toContain("brown");
    expect(res.body.data.suggestedTags.length).toBeGreaterThan(0);
    expect(res.body.data.note).toMatch(/review and edit/i);
  });

  test("rejects when neither name nor description is provided", async () => {
    const { artisanAuth } = await approveArtisan("artisan@example.com");
    const res = await request(app)
      .post("/api/ai/product-assist")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe("Smart sizing with a specific product", () => {
  test("recommends the closest size the product actually offers", async () => {
    const { admin, artisanAuth } = await approveArtisan("artisan@example.com");
    const categoryRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ name: "Sandals" });
    const productRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({
        category: categoryRes.body.data._id,
        name: "Sizing Test Sandal",
        description: "For testing size recommendations.",
        material: "Leather",
        colors: ["brown"],
        sizesAvailable: [38, 40, 42],
        price: 2000,
        stock: 5,
        images: ["https://example.com/image.jpg"],
      });

    const res = await request(app)
      .post("/api/sizing/recommend")
      .send({ footLengthCm: 26.5, preferredFit: "regular", product: productRes.body.data._id });
    expect(res.status).toBe(200);
    expect(res.body.data.availableSizes).toEqual([38, 40, 42]);
    expect([38, 40, 42]).toContain(res.body.data.recommendedSize);
  });
});
