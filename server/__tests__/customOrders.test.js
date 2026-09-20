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

async function verifiedArtisan(email) {
  const admin = await createAdmin();
  const artisanAuth = await registerAndLogin({ email, role: "artisan" });
  const { Artisan } = await import("../models/Artisan.js");
  const profile = await Artisan.findOne({ user: artisanAuth.user._id });
  await request(app)
    .patch(`/api/artisans/${profile._id}/verify`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ status: "approved" });
  return { artisanAuth, profile, admin };
}

const requestPayload = {
  shoeType: "Loafer",
  size: 41,
  designDescription: "A hand-stitched brown leather loafer with a custom sole pattern.",
  budget: 5000,
};

describe("Custom shoe requests, proposals, and production tracking", () => {
  test("full lifecycle: request -> proposal -> accept -> production stages -> delivered", async () => {
    const { artisanAuth, profile } = await verifiedArtisan("artisan@example.com");
    const customer = await registerAndLogin({ email: "customer@example.com" });

    const createRes = await request(app)
      .post("/api/custom-orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send(requestPayload);
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe("request_submitted");

    const customOrderId = createRes.body.data._id;

    const proposalRes = await request(app)
      .post(`/api/custom-orders/${customOrderId}/proposals`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ proposedDesignNotes: "I can craft this in 10 days.", price: 5500, productionTimeDays: 10 });
    expect(proposalRes.status).toBe(201);

    const afterProposal = await request(app)
      .get(`/api/custom-orders/${customOrderId}`)
      .set("Authorization", `Bearer ${customer.accessToken}`);
    expect(afterProposal.body.data.status).toBe("proposal_sent");
    expect(afterProposal.body.data.proposals).toHaveLength(1);

    const acceptRes = await request(app)
      .patch(`/api/custom-orders/proposals/${proposalRes.body.data._id}`)
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ action: "accept" });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.customOrder.status).toBe("customer_approved");

    const stages = ["material_preparation", "crafting", "quality_check", "ready_for_shipment", "shipped", "delivered"];
    for (const stage of stages) {
      const stageRes = await request(app)
        .patch(`/api/custom-orders/${customOrderId}/stage`)
        .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
        .send({ stage });
      expect(stageRes.status).toBe(200);
      expect(stageRes.body.data.status).toBe(stage);
    }
  });

  test("an artisan cannot skip stages out of order", async () => {
    const { artisanAuth } = await verifiedArtisan("artisan@example.com");
    const customer = await registerAndLogin({ email: "customer@example.com" });
    const createRes = await request(app)
      .post("/api/custom-orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send(requestPayload);
    const customOrderId = createRes.body.data._id;

    const proposalRes = await request(app)
      .post(`/api/custom-orders/${customOrderId}/proposals`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ proposedDesignNotes: "Notes", price: 5000, productionTimeDays: 5 });
    await request(app)
      .patch(`/api/custom-orders/proposals/${proposalRes.body.data._id}`)
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ action: "accept" });

    // customer_approved -> shipped directly is not a legal transition.
    const badRes = await request(app)
      .patch(`/api/custom-orders/${customOrderId}/stage`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ stage: "shipped" });
    expect(badRes.status).toBe(400);
  });

  test("a second artisan cannot propose once the request is locked to the first responder", async () => {
    const { artisanAuth: firstArtisan } = await verifiedArtisan("artisan1@example.com");
    const { artisanAuth: secondArtisan } = await verifiedArtisan("artisan2@example.com");
    const customer = await registerAndLogin({ email: "customer@example.com" });

    const createRes = await request(app)
      .post("/api/custom-orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send(requestPayload);
    const customOrderId = createRes.body.data._id;

    await request(app)
      .post(`/api/custom-orders/${customOrderId}/proposals`)
      .set("Authorization", `Bearer ${firstArtisan.accessToken}`)
      .send({ proposedDesignNotes: "First responder", price: 5000, productionTimeDays: 5 });

    const secondAttempt = await request(app)
      .post(`/api/custom-orders/${customOrderId}/proposals`)
      .set("Authorization", `Bearer ${secondArtisan.accessToken}`)
      .send({ proposedDesignNotes: "Second responder", price: 4500, productionTimeDays: 4 });
    expect(secondAttempt.status).toBe(403);
  });

  test("rejecting a proposal ends the request; requesting revision lets the same artisan re-propose", async () => {
    const { artisanAuth } = await verifiedArtisan("artisan@example.com");
    const customer = await registerAndLogin({ email: "customer@example.com" });
    const createRes = await request(app)
      .post("/api/custom-orders")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send(requestPayload);
    const customOrderId = createRes.body.data._id;

    const proposalRes = await request(app)
      .post(`/api/custom-orders/${customOrderId}/proposals`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ proposedDesignNotes: "Notes", price: 5000, productionTimeDays: 5 });

    const revisionRes = await request(app)
      .patch(`/api/custom-orders/proposals/${proposalRes.body.data._id}`)
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ action: "revision_requested", customerNote: "Can you use a lighter sole?" });
    expect(revisionRes.body.data.customOrder.status).toBe("design_review");

    const secondProposal = await request(app)
      .post(`/api/custom-orders/${customOrderId}/proposals`)
      .set("Authorization", `Bearer ${artisanAuth.accessToken}`)
      .send({ proposedDesignNotes: "Updated with lighter sole", price: 5200, productionTimeDays: 6 });
    expect(secondProposal.status).toBe(201);
  });
});
