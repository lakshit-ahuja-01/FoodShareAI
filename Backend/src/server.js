import "./config/env.js";
import express from "express";
import cors from "cors";
import http from "http";
import connectDB from "./config/db.js";
import { initSocket } from "./services/socket.service.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import authRoutes from "./routes/auth.routes.js";
import foodRoutes from "./routes/food.routes.js";
import ngoRoutes from "./routes/ngo.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();
const server = http.createServer(app);

// DB connect
connectDB()
  .then(() => console.log("✅ MongoDB Connection Handshake Successful"))
  .catch((err) => console.error("❌ MongoDB Initial Connection Failed:", err.message));

// Allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://food-share-ai.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

// Initialize Socket.io (must happen before server.listen)
initSocket(server, allowedOrigins);

// CORS
// CORS with debugging
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed for: ${origin}`);
        return callback(null, true);
      }

      console.error(`🚨 CORS BLOCKED for: ${origin}`);
      console.log(`📋 Allowed origins: ${allowedOrigins.join(", ")}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "FoodShare API", version: "1.0.0", description: "API documentation" },
    servers: [{ url: "https://foodshareai-backend.onrender.com" }],
  },
  apis: ["./routes/*.js"],
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerOptions)));

// Manual preflight handler
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] 📥 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/ai", aiRoutes);

// Health route
app.get("/", (req, res) => res.send("API running 🚀 - Connection Healthy"));

// 404 fallback
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 BACKEND ERROR:", err.message);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

// Start server (use http server, not app.listen — required for Socket.io)
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT} 🔥`);
  console.log(`🔌 Socket.io listening on port ${PORT}`);
});
