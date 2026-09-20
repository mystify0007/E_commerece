// Development seed script — creates demo data so the app is testable without
// building every admin flow by hand first. Safe to re-run (idempotent).
import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";

const ADMIN_EMAIL = "admin@juttax.local";
const ADMIN_PASSWORD = "Admin@12345";

const CATEGORIES = [
  "Handmade Shoes",
  "Sneakers",
  "Formal Shoes",
  "Boots",
  "Sandals",
  "Traditional Footwear",
  "Hiking Footwear",
  "Casual Footwear",
  "Custom Footwear",
];

async function seed() {
  await connectDB();

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
    const passwordHash = await User.hashPassword(ADMIN_PASSWORD);
    await User.create({
      name: "JuttaX Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "admin",
      isEmailVerified: true,
    });
    console.log(`Created demo admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`Demo admin already exists: ${ADMIN_EMAIL}`);
  }

  for (const name of CATEGORIES) {
    const exists = await Category.findOne({ name });
    if (!exists) {
      await Category.create({ name });
      console.log(`Created category: ${name}`);
    }
  }

  console.log("\nSeed complete. Log in at /login with the admin credentials above.");
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
