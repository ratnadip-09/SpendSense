// server.js — SpendSense Express + MongoDB server

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route files
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

// Connect to MongoDB
connectDB();

const app = express();

/* ── Middleware ── */

// Allow requests from the Vercel frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ── Health checks ── */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "SpendSense backend is running. Use /api/auth or /api/transactions.",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SpendSense API is running 🚀",
  });
});

/* ── Routes ── */

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

/* ── 404 handler ── */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ── Global error handler ── */

app.use(errorHandler);

/* ── Start server ── */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});