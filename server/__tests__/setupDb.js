import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-jwt-refresh-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

jest.setTimeout(60000); // first run downloads a real mongod binary, which can be slow

let replSet;

beforeAll(async () => {
  // A single-node replica set (not a plain standalone MongoMemoryServer) is
  // required so multi-document transactions work — the checkout flow uses
  // mongoose.startSession()/withTransaction() and standalone mongod does not
  // support that.
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGO_URI = replSet.getUri();
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
});
