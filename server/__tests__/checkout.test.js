import crypto from "crypto";
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

async function setupApprovedProduct({ price = 3500, stock = 5 } = {}) {
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
      name: "Handmade Leather Boot",
      description: "A beautifully handcrafted leather boot.",
      material: "Leather",
      colors: ["brown"],
      sizesAvailable: [40, 41, 42],
      price,
      stock,
      images: ["https://example.com/image1.jpg"],
    });

  await request(app)
    .patch(`/api/products/${productRes.body.data._id}/moderate`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ action: "approve" });

  return { admin, artisanAuth, productId: productRes.body.data._id };
}

const address = {
  fullName: "Sita Gurung",
  phone: "9800000000",
  line1: "Thamel",
  city: "Kathmandu",
};

describe("Cart & checkout", () => {
  test("adding an unapproved/nonexistent product to cart fails", async () => {
    const customer = await registerAndLogin({ email: "customer@example.com" });
    const res = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ product: "000000000000000000000000", quantity: 1, size: 41 });
    expect(res.status).toBe(404);
  });

  test("full checkout: cart -> order, stock decrements, price is server-calculated, cart clears", async () => {
    const { productId } = await setupApprovedProduct({ price: 3500, stock: 5 });
    const customer = await registerAndLogin({ email: "customer@example.com" });

    const addRes = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ product: productId, quantity: 2, size: 41 });
    expect(addRes.status).toBe(201);
    expect(addRes.body.data.subtotal).toBe(7000);

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ shippingAddress: address, paymentProvider: "cod" });
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.subtotal).toBe(7000);
    expect(orderRes.body.data.shippingFee).toBe(150);
    expect(orderRes.body.data.total).toBe(7150);
    expect(orderRes.body.data.items).toHaveLength(1);
    expect(orderRes.body.data.items[0].unitPrice).toBe(3500);

    const { Product } = await import("../models/Product.js");
    const product = await Product.findById(productId);
    expect(product.stock).toBe(3);

    const cartRes = await request(app).get("/api/cart").set("Authorization", `Bearer ${customer.accessToken}`);
    expect(cartRes.body.data.items).toHaveLength(0);

    const { Payment } = await import("../models/Payment.js");
    const payment = await Payment.findOne({ order: orderRes.body.data._id });
    expect(payment.provider).toBe("cod");
    expect(payment.amount).toBe(7150);
  });

  test("checkout with eSewa returns a signed redirect form instead of settling immediately", async () => {
    const { env } = await import("../config/env.js");
    const { productId } = await setupApprovedProduct({ price: 3500, stock: 5 });
    const customer = await registerAndLogin({ email: "esewacustomer@example.com" });

    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ product: productId, quantity: 1, size: 41 });

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ shippingAddress: address, paymentProvider: "esewa" });

    expect(orderRes.status).toBe(201);
    const { paymentRedirect } = orderRes.body.data;
    expect(paymentRedirect.method).toBe("POST");
    expect(paymentRedirect.url).toBe(env.esewa.formUrl);

    const fields = paymentRedirect.fields;
    expect(fields.product_code).toBe(env.esewa.productCode);
    expect(fields.transaction_uuid).toBe(orderRes.body.data._id);
    expect(fields.total_amount).toBe(orderRes.body.data.total);
    expect(fields.amount + fields.tax_amount + fields.product_service_charge + fields.product_delivery_charge).toBe(
      fields.total_amount
    );

    const expectedMessage = fields.signed_field_names
      .split(",")
      .map((key) => `${key}=${fields[key]}`)
      .join(",");
    const expectedSignature = crypto.createHmac("sha256", env.esewa.secretKey).update(expectedMessage).digest("base64");
    expect(fields.signature).toBe(expectedSignature);

    // eSewa checkout doesn't settle inline: the payment stays "initiated"
    // until the frontend callback re-verifies it against eSewa's API.
    const { Payment } = await import("../models/Payment.js");
    const payment = await Payment.findOne({ order: orderRes.body.data._id });
    expect(payment.status).toBe("initiated");
    expect(payment.providerTransactionId).toBe(orderRes.body.data._id);
  });

  test("checkout rejects when requested quantity exceeds current stock (race-safe)", async () => {
    const { productId } = await setupApprovedProduct({ price: 1000, stock: 1 });
    const customer = await registerAndLogin({ email: "customer@example.com" });

    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ product: productId, quantity: 1, size: 41 });

    // Simulate the stock being sold out by another order between add-to-cart
    // and checkout.
    const { Product } = await import("../models/Product.js");
    await Product.findByIdAndUpdate(productId, { stock: 0 });

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ shippingAddress: address, paymentProvider: "cod" });
    expect(orderRes.status).toBe(409);

    // Stock must be unchanged (transaction rolled back), and cart must still
    // have the item (checkout did not silently succeed or partially apply).
    const product = await Product.findById(productId);
    expect(product.stock).toBe(0);
    const cartRes = await request(app).get("/api/cart").set("Authorization", `Bearer ${customer.accessToken}`);
    expect(cartRes.body.data.items).toHaveLength(1);
  });

  test("a customer cannot see another customer's order", async () => {
    const { productId } = await setupApprovedProduct();
    const customer1 = await registerAndLogin({ email: "buyer1@example.com" });
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer1.accessToken}`)
      .send({ product: productId, quantity: 1, size: 41 });
    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customer1.accessToken}`)
      .send({ shippingAddress: address, paymentProvider: "cod" });

    const customer2 = await registerAndLogin({ email: "buyer2@example.com" });
    const getRes = await request(app)
      .get(`/api/orders/${orderRes.body.data._id}`)
      .set("Authorization", `Bearer ${customer2.accessToken}`);
    expect(getRes.status).toBe(403);
  });

  test("an artisan sees only their own line items on a shared order, never other artisans'", async () => {
    const admin = await createAdmin();

    const { productId: productA } = await setupApprovedProduct({ price: 1000 });
    const secondArtisanAuth = await registerAndLogin({ email: "artisan2@example.com", role: "artisan" });
    const { Artisan } = await import("../models/Artisan.js");
    const secondProfile = await Artisan.findOne({ user: secondArtisanAuth.user._id });
    await request(app)
      .patch(`/api/artisans/${secondProfile._id}/verify`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "approved" });
    const { Category } = await import("../models/Category.js");
    const category = await Category.findOne();
    const productBRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${secondArtisanAuth.accessToken}`)
      .send({
        category: category._id,
        name: "Second Artisan Sandal",
        description: "A different artisan's product entirely.",
        material: "Canvas",
        colors: ["white"],
        sizesAvailable: [40],
        price: 2000,
        stock: 5,
        images: ["https://example.com/image2.jpg"],
      });
    await request(app)
      .patch(`/api/products/${productBRes.body.data._id}/moderate`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ action: "approve" });

    const customer = await registerAndLogin({ email: "multibuyer@example.com" });
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ product: productA, quantity: 1, size: 41 });
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ product: productBRes.body.data._id, quantity: 1, size: 40 });

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ shippingAddress: address, paymentProvider: "cod" });
    expect(orderRes.body.data.items).toHaveLength(2);

    const firstArtisanLogin = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "artisan@example.com", password: "password123" });
    const firstArtisanView = await request(app)
      .get(`/api/orders/${orderRes.body.data._id}`)
      .set("Authorization", `Bearer ${firstArtisanLogin.body.data.accessToken}`);
    expect(firstArtisanView.status).toBe(200);
    expect(firstArtisanView.body.data.items).toHaveLength(1);
    expect(firstArtisanView.body.data.items[0].product.name).toBe("Handmade Leather Boot");
  });
});
