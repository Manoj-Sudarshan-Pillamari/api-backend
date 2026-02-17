const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();
require("./config/cloudinary");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Brands Backend API is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/popular-brands", require("./routes/popularBrandRoutes"));
app.use("/api/pip-videos", require("./routes/pipVideoRoutes"));

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
