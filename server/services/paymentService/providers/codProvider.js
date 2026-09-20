// Cash on Delivery: no online transaction. Payment stays "initiated" until
// the order is marked delivered, at which point an artisan/admin can record
// collection separately. This is a fully real, working provider — common
// for the Nepali e-commerce market this project targets.
export const codProvider = {
  name: "cod",
  async initiate() {
    return { status: "initiated", providerTransactionId: null, paidAt: null };
  },
  async verify() {
    return { status: "initiated" };
  },
};
