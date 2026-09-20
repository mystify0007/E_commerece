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

async function fullPurchaseFlow() {
  const admin = await createAdmin();
  const artisanAuth = await registerAndLogin({ email: "artisan@example.com", role: "artisan" });
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
      name: "Reviewable Boot",
      description: "A boot for testing reviews.",
      material: "Leather",
      colors: ["brown"],
      sizesAvailable: [41],
      price: 3000,
      stock: 5,
      images: ["https://example.com/image.jpg"],
    });
  await request(app)
    .patch(`/api/products/${productRes.body.data._id}/moderate`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ action: "approve" });

  const customer = await registerAndLogin({ email: "customer@example.com" });
  await request(app)
    .post("/api/cart/items")
    .set("Authorization", `Bearer ${customer.accessToken}`)
    .send({ product: productRes.body.data._id, quantity: 1, size: 41 });
  const orderRes = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${customer.accessToken}`)
    .send({
      shippingAddress: { fullName: "Sita Gurung", phone: "9800000000", line1: "Thamel", city: "Kathmandu" },
      paymentProvider: "cod",
    });

  return {
    admin,
    artisanAuth,
    artisanProfile,
    customer,
    productId: productRes.body.data._id,
    orderId: orderRes.body.data._id,
  };
}

describe("Reviews", () => {
  test("cannot review before the order is delivered", async () => {
    const { customer, productId, orderId } = await fullPurchaseFlow();
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ targetType: "Product", target: productId, order: orderId, rating: 5, comment: "Great!" });
    expect(res.status).toBe(400);
  });

  test("can review a product after delivery, and it updates the product's rating", async () => {
    const { admin, customer, productId, orderId } = await fullPurchaseFlow();
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "confirmed" });
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "processing" });
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "shipped" });
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "delivered" });

    const reviewRes = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ targetType: "Product", target: productId, order: orderId, rating: 4, comment: "Solid boots." });
    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.data.isVerifiedPurchase).toBe(true);

    const productRes = await request(app).get(`/api/products/${productId}`);
    expect(productRes.body.data.ratingAvg).toBe(4);
    expect(productRes.body.data.ratingCount).toBe(1);

    const listRes = await request(app).get(`/api/reviews/product/${productId}`);
    expect(listRes.body.data.items).toHaveLength(1);
  });

  test("cannot review the same product twice for the same order", async () => {
    const { admin, customer, productId, orderId } = await fullPurchaseFlow();
    for (const status of ["confirmed", "processing", "shipped", "delivered"]) {
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ status });
    }
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ targetType: "Product", target: productId, order: orderId, rating: 5 });

    const secondRes = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ targetType: "Product", target: productId, order: orderId, rating: 3 });
    expect(secondRes.status).toBe(409);
  });

  test("cannot review a product you didn't actually order", async () => {
    const { admin, customer, orderId } = await fullPurchaseFlow();
    for (const status of ["confirmed", "processing", "shipped", "delivered"]) {
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ status });
    }
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ targetType: "Product", target: "000000000000000000000000", order: orderId, rating: 5 });
    expect(res.status).toBe(400);
  });
});

describe("Notifications", () => {
  test("registration creates a welcome notification the user can list and mark read", async () => {
    const auth = await registerAndLogin({ email: "notify@example.com" });

    const listRes = await request(app).get("/api/notifications").set("Authorization", `Bearer ${auth.accessToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.items.length).toBeGreaterThan(0);
    expect(listRes.body.data.unreadCount).toBeGreaterThan(0);

    const notificationId = listRes.body.data.items[0]._id;
    const readRes = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${auth.accessToken}`);
    expect(readRes.body.data.isRead).toBe(true);
  });

  test("a user cannot mark another user's notification as read", async () => {
    const auth1 = await registerAndLogin({ email: "user1@example.com" });
    const auth2 = await registerAndLogin({ email: "user2@example.com" });

    const listRes = await request(app).get("/api/notifications").set("Authorization", `Bearer ${auth1.accessToken}`);
    const notificationId = listRes.body.data.items[0]._id;

    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${auth2.accessToken}`);
    expect(res.status).toBe(404);
  });
});
