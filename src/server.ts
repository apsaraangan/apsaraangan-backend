import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "https://apsaraangan.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Apsara Angan API" });
});

app.get("/health", (_req, res) => {
  const dbReadyState = mongoose.connection.readyState;
  const dbStatus =
    dbReadyState === 1
      ? "connected"
      : dbReadyState === 2
        ? "connecting"
        : dbReadyState === 0
          ? "disconnected"
          : "disconnecting";

  res.status(200).json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    db: dbStatus,
  });
});

app.use("/api/products", productRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/customer", customerRoutes);

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

connectDb().catch((err) => {
  console.error("Failed to connect to MongoDB", err);
});

