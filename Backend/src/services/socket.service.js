import { Server } from "socket.io";

// Singleton socket.io instance
let io = null;

// Map: userId (string) → Set<socketId>
const userSockets = new Map();

/**
 * Initialize Socket.io on the http.Server instance.
 * Must be called once in server.js before server.listen().
 */
export function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client registers their DB userId right after connecting
    socket.on("register", (userId) => {
      const uid = String(userId);
      if (!userSockets.has(uid)) userSockets.set(uid, new Set());
      userSockets.get(uid).add(socket.id);
      console.log(`👤 User ${uid} registered socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      // Clean up the socket from all user maps
      userSockets.forEach((sockets, uid) => {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(uid);
      });
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit a real-time event to all active sockets for a specific user.
 */
export function emitToUser(userId, event, data) {
  if (!io) return;
  const uid = String(userId);
  const sockets = userSockets.get(uid);
  if (sockets && sockets.size > 0) {
    sockets.forEach((socketId) => io.to(socketId).emit(event, data));
    console.log(`📡 Emitted "${event}" to user ${uid} (${sockets.size} socket(s))`);
  } else {
    console.log(`⚠️  No active sockets for user ${uid} — notification saved to DB only`);
  }
}

export function getIO() {
  return io;
}
