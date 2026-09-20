import crypto from "crypto";

// A working sandbox provider for development/demo: simulates an instant
// successful online payment with no external dependency. Never used in
// production — real deployments configure esewa/khalti with real
// credentials, or use "cod".
export const mockProvider = {
  name: "mock",
  async initiate(order) {
    return {
      status: "success",
      providerTransactionId: `MOCK-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
      paidAt: new Date(),
    };
  },
  async verify() {
    return { status: "success" };
  },
};
