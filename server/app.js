import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

import { env } from "./config/env.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import artisanRoutes from "./routes/artisanRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import customizationRoutes from "./routes/customizationRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import sizingRoutes from "./routes/sizingRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
}
app.use(generalLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/customizations", customizationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/sizing", sizingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
