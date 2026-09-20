// Minimal env setup for tests that never touch the database (HTTP/middleware layer only).
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-jwt-refresh-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
