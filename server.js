const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// ============================================
// Load environment variables FIRST
// ============================================
dotenv.config();

// ============================================
// Connect to MongoDB
// ============================================
connectDB();

// ============================================
// Initialize Cloudinary
// ============================================
require("./config/cloudinary");

// ============================================
// Initialize Express App
// ============================================
const app = express();

// ============================================
// Middleware
// ============================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Routes
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Premium Brands Backend API is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/content", require("./routes/contentRoutes"));

// ============================================
// Error handling middleware
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  if (err.message === "Only images, videos and GIFs are allowed!") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size exceeds 50 MB limit",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});
