const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const contentRoutes = require("./routes/contentRoutes");
const popularBrandRoutes = require("./routes/popularBrandRoutes");

require("dotenv").config();

const app = express();

// Connect to DB
connectDB();

// CORS
app.use(
  cors({
    origin: [process.env.ADMIN_FRONTEND_URL, process.env.USER_FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/content", contentRoutes);
app.use("/api/popular-brands", popularBrandRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
