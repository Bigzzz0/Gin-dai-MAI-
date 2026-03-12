import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import * as dotenv from "dotenv";

import { authRoutes } from "./routes/auth.routes";
import { scanRoutes } from "./routes/scan.routes";
import { historyRoutes } from "./routes/history.routes";
import { feedbackRoutes } from "./routes/feedback.routes";

dotenv.config();

const app = Fastify({ logger: true });

// --- Plugins ---
app.register(cors, {
  origin: "*", // Restrict in production
  methods: ["GET", "POST", "PUT", "DELETE"],
});

app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// --- Health Check ---
app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// --- Routes ---
app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(scanRoutes, { prefix: "/api/v1/scans" });
app.register(historyRoutes, { prefix: "/api/v1/history" });
app.register(feedbackRoutes, { prefix: "/api/v1/scans" });

// --- Start Server ---
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3000", 10);
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
