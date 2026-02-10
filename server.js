const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// ============================================
// Load environment variables
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
// CORS - Allow BOTH frontends to connect
// ============================================
const allowedOrigins = [
  "http://localhost:5173", // Local dev - Admin
  "http://localhost:5174", // Local dev - User
  "http://localhost:3000", // Local dev - Alternative
  "http://localhost:3001", // Local dev - Alternative
];

// Add Admin Frontend URL if exists
if (process.env.ADMIN_FRONTEND_URL) {
  allowedOrigins.push(process.env.ADMIN_FRONTEND_URL);
}

// Add User Frontend URL if exists
if (process.env.USER_FRONTEND_URL) {
  allowedOrigins.push(process.env.USER_FRONTEND_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
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
// Error handling
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
  console.log(`🔗 Allowed Origins:`, allowedOrigins);
});
