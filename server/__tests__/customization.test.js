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

async function setupApprovedProduct() {
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

  const productRes = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
    .send({
      category: categoryRes.body.data._id,
      name: "Base Boot",
      description: "A boot that can be customized.",
      material: "Leather",
      colors: ["brown"],
      sizesAvailable: [41],
      price: 3500,
      stock: 10,
      images: ["https://example.com/image1.jpg"],
    });
  await request(app)
    .patch(`/api/products/${productRes.body.data._id}/moderate`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ action: "approve" });

  return { admin, artisanAuth, productId: productRes.body.data._id };
}

describe("Shoe customizer", () => {
  test("adding an option auto-marks the product customizable, and price preview sums base + deltas", async () => {
    const { artisanAuth, productId } = await setupApprovedProduct();

    const optionRes = await request(app)
      .post(`/api/customizations/product/${productId}`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ type: "sole", label: "Thick sole", priceDelta: 500 });
    expect(optionRes.status).toBe(201);

    const productCheck = await request(app).get(`/api/products/${productId}`);
    expect(productCheck.body.data.isCustomizable).toBe(true);

    const previewRes = await request(app)
      .post("/api/customizations/price-preview")
      .send({ product: productId, customizationOptions: [optionRes.body.data._id] });
    expect(previewRes.status).toBe(200);
    expect(previewRes.body.data.basePrice).toBe(3500);
    expect(previewRes.body.data.finalPrice).toBe(4000);
  });

  test("another artisan cannot add customization options to someone else's product", async () => {
    const { productId } = await setupApprovedProduct();
    const secondArtisanAuth = await registerAndLogin({ email: "artisan2@example.com", role: "artisan" });

    const res = await request(app)
      .post(`/api/customizations/product/${productId}`)
      .set("Authorization", `Bearer ${secondArtisanAuth.accessToken}`)
      .send({ type: "color", label: "Black", priceDelta: 0 });
    expect(res.status).toBe(403);
  });

  test("checkout price includes customization deltas, calculated server-side", async () => {
    const { artisanAuth, productId } = await setupApprovedProduct();
    const optionRes = await request(app)
      .post(`/api/customizations/product/${productId}`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ type: "personalization", label: "Initials", priceDelta: 300 });

    const customer = await registerAndLogin({ email: "customer@example.com" });
    const addRes = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ product: productId, quantity: 1, size: 41, customizationOptions: [optionRes.body.data._id] });
    expect(addRes.body.data.items[0].unitPrice).toBe(3800);

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({
        shippingAddress: { fullName: "Sita Gurung", phone: "9800000000", line1: "Thamel", city: "Kathmandu" },
        paymentProvider: "cod",
      });
    expect(orderRes.body.data.items[0].unitPrice).toBe(3800);
    expect(orderRes.body.data.items[0].customizationSnapshot.selections[0].label).toBe("Initials");
  });
});
