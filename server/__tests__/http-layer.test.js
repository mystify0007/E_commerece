// These checks exercise the HTTP/middleware pipeline (validation, routing,
// error handling, and the parts of the auth guard that reject BEFORE any
// database call) without touching MongoDB, so they run even when no database
// connection is available. Anything that needs a real user record (a validly
// signed token, role/ownership checks) lives in the db-integration suite,
// since `authenticate` always calls User.findById once a token verifies.
import request from "supertest";
import app from "../app.js";

describe("HTTP layer (no database required)", () => {
  test("health check responds without a database connection", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ok");
  });

  test("unknown routes return a consistent 404 envelope", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("register rejects payloads that fail schema validation", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "short",
    });
    expect(res.status).toBe(422);
    expect(res.body.error.details.email).toBeDefined();
    expect(res.body.error.details.password).toBeDefined();
  });

  test("register rejects role=admin at the schema level (only customer/artisan allowed)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Someone",
      email: "someone@example.com",
      password: "password123",
      role: "admin",
    });
    expect(res.status).toBe(422);
  });

  test("protected routes reject requests with no Authorization header", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("protected routes reject a malformed/garbage bearer token without touching the DB", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer garbage.token.value");
    expect(res.status).toBe(401);
  });

  test("protected routes reject a token signed with the wrong secret", async () => {
    // Simulates a forged token: well-formed JWT, wrong signature. jwt.verify()
    // throws before any DB call, so this stays DB-independent.
    const jwt = await import("jsonwebtoken");
    const forged = jwt.default.sign({ sub: "000000000000000000000000", role: "admin" }, "wrong-secret");
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  test("change-password requires authentication before validation runs", async () => {
    const res = await request(app).patch("/api/auth/change-password").send({});
    expect(res.status).toBe(401);
  });

  test("product listing rejects an invalid query (bad ObjectId for category) before hitting the DB", async () => {
    const res = await request(app).get("/api/products").query({ category: "not-an-id" });
    expect(res.status).toBe(422);
  });

  test("creating a product requires authentication", async () => {
    const res = await request(app).post("/api/products").send({});
    expect(res.status).toBe(401);
  });

  test("creating a category requires authentication", async () => {
    const res = await request(app).post("/api/categories").send({ name: "Boots" });
    expect(res.status).toBe(401);
  });

  test("verifying an artisan requires authentication", async () => {
    const res = await request(app)
      .patch("/api/artisans/000000000000000000000000/verify")
      .send({ status: "approved" });
    expect(res.status).toBe(401);
  });
});
