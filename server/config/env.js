import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];

function validateEnv() {
  if (process.env.NODE_ENV === "test") return;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill them in.`
    );
  }
}

validateEnv();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  ai: {
    apiKey: process.env.AI_API_KEY,
    apiUrl: process.env.AI_API_URL,
  },
  payment: {
    apiKey: process.env.PAYMENT_API_KEY,
    secret: process.env.PAYMENT_SECRET,
  },
  // eSewa ePay v2 defaults to eSewa's own publicly documented sandbox
  // merchant (EPAYTEST) so the integration works out of the box in
  // development; override with real merchant credentials to go live.
  esewa: {
    productCode: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
    secretKey: process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q",
    formUrl: process.env.ESEWA_FORM_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    statusUrl: process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/",
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "noreply@juttax.local",
  },
};
