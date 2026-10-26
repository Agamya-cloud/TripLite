import "dotenv/config";
import express, { type RequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import tripRoutes from "./routes/trips";
import expenseRoutes from "./routes/expenses";
import checklistRoutes from "./routes/checklists";
import itineraryRoutes from "./routes/itineraries";
import { requireAuth } from "./auth";
import { connectDatabase, isDatabaseReady } from "./db";

export function createServer() {
  const app = express();
  const allowedOrigins = new Set(
    (process.env.CORS_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const database = connectDatabase();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: (origin, callback) =>
        callback(null, !origin || allowedOrigins.has(origin)),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  app.use(cookieParser());
  app.use("/api", (req, res, next) => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
    const origin = req.get("origin");
    if (!origin) return next();
    try {
      if (
        new URL(origin).host === req.get("host") ||
        allowedOrigins.has(origin)
      )
        return next();
    } catch {
      return res.status(403).json({ error: "Request origin is not allowed." });
    }
    return res.status(403).json({ error: "Request origin is not allowed." });
  });

  const requireDatabase: RequestHandler = async (_req, res, next) => {
    if (isDatabaseReady()) return next();
    try {
      const pendingConnection = connectDatabase();
      if (pendingConnection) await pendingConnection;
    } catch {
      return res
        .status(503)
        .json({ error: "The TripLite database is unavailable." });
    }
    if (isDatabaseReady()) return next();
    return res
      .status(503)
      .json({
        error:
          "MongoDB is not configured. Set MONGODB_URI to enable accounts and saved travel data.",
      });
  };

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.use("/api/auth", requireDatabase, authRoutes);
  app.use("/api/trips", requireDatabase, requireAuth, tripRoutes);
  app.use("/api/expenses", requireDatabase, requireAuth, expenseRoutes);
  app.use("/api/checklists", requireDatabase, requireAuth, checklistRoutes);
  app.use("/api/itineraries", requireDatabase, requireAuth, itineraryRoutes);

  app.use(
    (
      error: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (res.headersSent) return;
      const status = error?.status === 400 ? 400 : 500;
      if (status === 500)
        console.error(
          "TripLite request failed:",
          error instanceof Error ? error.message : error,
        );
      return res.status(status).json({
        error:
          status === 400
            ? "Request body is invalid JSON."
            : "Something went wrong. Please try again.",
      });
    },
  );

  database?.catch(() => undefined);
  return app;
}
