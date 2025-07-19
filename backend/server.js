// server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const connectDB = require("./config/database"); // From [2]

// Use custom CORS from cors.js [1 ]
const customCors = require("./config/cors"); // Assuming path; adjust if needed

// Route handlers
const authRoutes = require("./routes/authRoutes"); // [16]
const organizationRoutes = require("./routes/organizationRoutes"); // [17]
const attendanceRoutes = require("./routes/attendanceRoutes"); // [15]
const qrRoutes = require("./routes/qrRoutes"); // [18]

// Scheduled job
const qrScheduler = require("./jobs/qrScheduler"); // [7]

// App setup
const app = express();

// Connect to MongoDB
connectDB();

// Rate Limiter (1 hour window, 100 requests)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: "Too many requests from this IP, please try again later",
});

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(customCors); // Use custom CORS for better origin/method control [1]
app.use(limiter);

// Routers
app.use("/api/auth", authRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/qr", qrRoutes);

// Schedule daily QR code generation at 00:00 (midnight), considering org timezones [12]
cron.schedule("0 0 * * *", async () => {
  console.log("[CRON] Running Daily QR Code Generation");
  try {
    await qrScheduler.generateDailyQRCodes();
  } catch (error) {
    console.error("Cron job error:", error);
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("✅ MERN Stack Attendance Backend is Running...");
});

// Global error handler (improved for detailed logging)
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack); // Full stack for debugging
  res.status(500).json({
    message: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
