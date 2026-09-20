import request from "supertest";
import app from "../app.js";

async function registerAndLogin(overrides = {}) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test User", email: "user@example.com", password: "password123", ...overrides });
  return res.body.data; // { user, accessToken, refreshToken }
}

async function createAdmin() {
  // There is no public admin registration route (by design); tests create
  // one directly through the model, exactly as a seed script would.
  const { User } = await import("../models/User.js");
  const passwordHash = await User.hashPassword("adminpass123");
  const admin = await User.create({ name: "Admin", email: "admin@example.com", passwordHash, role: "admin" });
  const { issueTokens } = await import("../services/authService.js");
  return issueTokens(admin);
}

async function createApprovedArtisanWithCategory() {
  const artisanAuth = await registerAndLogin({ email: "artisan@example.com", role: "artisan" });
  const admin = await createAdmin();

  const { Artisan } = await import("../models/Artisan.js");
  const artisanProfile = await Artisan.findOne({ user: artisanAuth.user._id });

  await request(app)
    .patch(`/api/artisans/${artisanProfile._id}/verify`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ status: "approved" });

  const categoryRes = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ name: "Boots" });

  return { artisanAuth, admin, category: categoryRes.body.data, artisanProfile };
}

const validProductPayload = (categoryId) => ({
  category: categoryId,
  name: "Handmade Leather Boot",
  description: "A beautifully handcrafted leather boot made by a local artisan.",
  material: "Leather",
  colors: ["brown"],
  sizesAvailable: [40, 41, 42],
  soleType: "rubber",
  price: 3500,
  stock: 10,
  images: ["https://example.com/image1.jpg"],
});

describe("Product marketplace", () => {
  test("unverified artisans cannot create products", async () => {
    const artisanAuth = await registerAndLogin({ email: "unverified@example.com", role: "artisan" });
    const admin = await createAdmin();
    const categoryRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ name: "Sneakers" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send(validProductPayload(categoryRes.body.data._id));

    expect(res.status).toBe(403);
  });

  test("verified artisan creates a product, which starts pending and is invisible in public listing", async () => {
    const { artisanAuth, category } = await createApprovedArtisanWithCategory();

    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send(validProductPayload(category._id));

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe("pending");

    const listRes = await request(app).get("/api/products");
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.items).toHaveLength(0);
  });

  test("admin approval makes a product visible in the public listing", async () => {
    const { artisanAuth, admin, category } = await createApprovedArtisanWithCategory();

    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send(validProductPayload(category._id));
    const productId = createRes.body.data._id;

    const moderateRes = await request(app)
      .patch(`/api/products/${productId}/moderate`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ action: "approve" });
    expect(moderateRes.status).toBe(200);
    expect(moderateRes.body.data.status).toBe("approved");

    const listRes = await request(app).get("/api/products");
    expect(listRes.body.data.items).toHaveLength(1);
    expect(listRes.body.data.items[0].name).toBe("Handmade Leather Boot");
  });

  test("server ignores a client-supplied price on update; price changes only via the authenticated artisan's own edit", async () => {
    const { artisanAuth, admin, category } = await createApprovedArtisanWithCategory();
    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send(validProductPayload(category._id));
    const productId = createRes.body.data._id;

    await request(app)
      .patch(`/api/products/${productId}/moderate`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ action: "approve" });

    const updateRes = await request(app)
      .patch(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ price: 4200 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.price).toBe(4200);
  });

  test("one artisan cannot edit or delete another artisan's product", async () => {
    const { artisanAuth, admin, category } = await createApprovedArtisanWithCategory();
    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send(validProductPayload(category._id));
    const productId = createRes.body.data._id;

    // Second, separately-verified artisan.
    const secondArtisanAuth = await registerAndLogin({ email: "second-artisan@example.com", role: "artisan" });
    const { Artisan } = await import("../models/Artisan.js");
    const secondProfile = await Artisan.findOne({ user: secondArtisanAuth.user._id });
    await request(app)
      .patch(`/api/artisans/${secondProfile._id}/verify`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "approved" });

    const editAttempt = await request(app)
      .patch(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${secondArtisanAuth.accessToken}`)
      .send({ price: 1 });
    expect(editAttempt.status).toBe(403);

    const deleteAttempt = await request(app)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${secondArtisanAuth.accessToken}`);
    expect(deleteAttempt.status).toBe(403);
  });

  test("search/filter/pagination work together on the public listing", async () => {
    const { artisanAuth, admin, category } = await createApprovedArtisanWithCategory();

    const products = [
      { ...validProductPayload(category._id), name: "Brown Leather Boot", price: 3000, colors: ["brown"] },
      { ...validProductPayload(category._id), name: "Black Leather Boot", price: 6000, colors: ["black"] },
      { ...validProductPayload(category._id), name: "White Canvas Sneaker", price: 1500, colors: ["white"], material: "Canvas" },
    ];

    for (const payload of products) {
      const createRes = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
        .send(payload);
      await request(app)
        .patch(`/api/products/${createRes.body.data._id}/moderate`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ action: "approve" });
    }

    const byColor = await request(app).get("/api/products").query({ color: "brown" });
    expect(byColor.body.data.items).toHaveLength(1);
    expect(byColor.body.data.items[0].name).toBe("Brown Leather Boot");

    const byPriceRange = await request(app).get("/api/products").query({ minPrice: 2000, maxPrice: 4000 });
    expect(byPriceRange.body.data.items).toHaveLength(1);

    const paginated = await request(app).get("/api/products").query({ limit: 2, page: 1, sort: "price_asc" });
    expect(paginated.body.data.items).toHaveLength(2);
    expect(paginated.body.data.total).toBe(3);
    expect(paginated.body.data.items[0].price).toBeLessThanOrEqual(paginated.body.data.items[1].price);
  });

  test("deleting a product archives it rather than removing it", async () => {
    const { artisanAuth, admin, category } = await createApprovedArtisanWithCategory();
    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send(validProductPayload(category._id));
    const productId = createRes.body.data._id;
    await request(app)
      .patch(`/api/products/${productId}/moderate`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ action: "approve" });

    const deleteRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`);
    expect(deleteRes.status).toBe(200);

    const { Product } = await import("../models/Product.js");
    const stillExists = await Product.findById(productId);
    expect(stillExists).not.toBeNull();
    expect(stillExists.status).toBe("archived");

    const listRes = await request(app).get("/api/products");
    expect(listRes.body.data.items).toHaveLength(0);
  });
});
