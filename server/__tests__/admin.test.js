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

describe("Admin panel", () => {
  test("non-admin roles cannot access admin routes", async () => {
    const customer = await registerAndLogin({ email: "customer@example.com" });
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${customer.accessToken}`);
    expect(res.status).toBe(403);
  });

  test("dashboard reflects real counts", async () => {
    const admin = await createAdmin();
    await registerAndLogin({ email: "c1@example.com" });
    await registerAndLogin({ email: "a1@example.com", role: "artisan" });

    const res = await request(app).get("/api/admin/dashboard").set("Authorization", `Bearer ${admin.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalCustomers).toBe(1);
    expect(res.body.data.totalArtisans).toBe(1);
    expect(res.body.data.pendingArtisans).toBe(1);
  });

  test("admin can list and search users, and suspend a customer", async () => {
    const admin = await createAdmin();
    const customer = await registerAndLogin({ email: "findme@example.com", name: "Findable Person" });

    const searchRes = await request(app)
      .get("/api/admin/users")
      .query({ search: "Findable" })
      .set("Authorization", `Bearer ${admin.accessToken}`);
    expect(searchRes.body.data.items).toHaveLength(1);

    const suspendRes = await request(app)
      .patch(`/api/admin/users/${customer.user._id}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "suspended" });
    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.data.status).toBe("suspended");

    // A suspended user is rejected at the auth middleware even with a
    // previously-valid access token.
    const meRes = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${customer.accessToken}`);
    expect(meRes.status).toBe(403);
  });

  test("admin cannot suspend another admin", async () => {
    const admin = await createAdmin();
    const { User } = await import("../models/User.js");
    const passwordHash = await User.hashPassword("password123");
    const secondAdmin = await User.create({ name: "Second Admin", email: "admin2@example.com", passwordHash, role: "admin" });

    const res = await request(app)
      .patch(`/api/admin/users/${secondAdmin._id}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "suspended" });
    expect(res.status).toBe(403);
  });

  test("admin product/artisan queues show pending items regardless of status filters used elsewhere", async () => {
    const admin = await createAdmin();
    const artisan = await registerAndLogin({ email: "artisan2@example.com", role: "artisan" });

    const artisansRes = await request(app)
      .get("/api/admin/artisans")
      .query({ status: "pending" })
      .set("Authorization", `Bearer ${admin.accessToken}`);
    expect(artisansRes.body.data.items).toHaveLength(1);
    expect(artisansRes.body.data.items[0].user.email).toBe("artisan2@example.com");
  });
});
