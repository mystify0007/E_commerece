import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyAccessToken } from "../utils/tokens.js";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // allow anonymous connections for public pages

    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
    } catch {
      // invalid token: connect anonymously rather than rejecting the socket
    }
    next();
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initSocket(httpServer) first.");
  }
  return io;
}

// Emits a real-time event to a specific user's room, if they're connected.
export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}
