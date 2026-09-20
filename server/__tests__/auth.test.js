import request from "supertest";
import app from "../app.js";

describe("Auth & Authorization", () => {
  test("registers a new customer and returns tokens", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Sita Gurung",
      email: "sita@example.com",
      password: "password123",
      role: "customer",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("sita@example.com");
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.accessToken).toEqual(expect.any(String));
  });

  test("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Sita Gurung",
      email: "sita@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Sita Gurung 2",
      email: "sita@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("rejects registration with role=admin (only customer/artisan allowed)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Hacker",
      email: "hacker@example.com",
      password: "password123",
      role: "admin",
    });

    expect(res.status).toBe(422);
  });

  test("logs in with correct credentials and rejects wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Ram Shrestha",
      email: "ram@example.com",
      password: "password123",
      role: "artisan",
    });

    const good = await request(app)
      .post("/api/auth/login")
      .send({ email: "ram@example.com", password: "password123" });
    expect(good.status).toBe(200);
    expect(good.body.data.accessToken).toEqual(expect.any(String));

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: "ram@example.com", password: "wrongpassword" });
    expect(bad.status).toBe(401);
  });

  test("blocks access to protected route without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("allows access to protected route with a valid token", async () => {
    const register = await request(app).post("/api/auth/register").send({
      name: "Gita Rai",
      email: "gita@example.com",
      password: "password123",
    });
    const token = register.body.data.accessToken;

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("gita@example.com");
  });

  test("rejects tampered/invalid tokens", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  test("password reset flow: request token, use it, then old password stops working", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Bina Thapa",
      email: "bina@example.com",
      password: "oldpassword1",
    });

    const forgot = await request(app).post("/api/auth/forgot-password").send({ email: "bina@example.com" });
    expect(forgot.status).toBe(200);
    const resetToken = forgot.body.data.resetToken;
    expect(resetToken).toEqual(expect.any(String));

    const reset = await request(app)
      .post(`/api/auth/reset-password/${resetToken}`)
      .send({ password: "newpassword1" });
    expect(reset.status).toBe(200);

    const oldLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "bina@example.com", password: "oldpassword1" });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "bina@example.com", password: "newpassword1" });
    expect(newLogin.status).toBe(200);
  });

  test("refresh token rotates access token and is revoked on logout", async () => {
    const register = await request(app).post("/api/auth/register").send({
      name: "Hari Bahadur",
      email: "hari@example.com",
      password: "password123",
    });
    const { accessToken, refreshToken } = register.body.data;

    const refreshed = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toEqual(expect.any(String));

    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(logout.status).toBe(200);

    const afterLogout = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(afterLogout.status).toBe(401);
  });
});
