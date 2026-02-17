const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  savePopularBrand,
  fetchPopularBrands,
  fetchActivePopularBrands,
  fetchPopularBrandById,
  updatePopularBrand,
  togglePopularBrandStatus,
  deletePopularBrand,
} = require("../controllers/popularBrandController");

// POST /api/popular-brands - Save new popular brand
router.post("/", upload.single("media"), savePopularBrand);

// GET /api/popular-brands - Get all popular brands (Admin)
router.get("/", fetchPopularBrands);

// GET /api/popular-brands/live/now - Get active & currently live (User UI)
router.get("/live/now", fetchActivePopularBrands);

// GET /api/popular-brands/:id - Get single popular brand
router.get("/:id", fetchPopularBrandById);

// PUT /api/popular-brands/:id - Update popular brand
router.put("/:id", upload.single("media"), updatePopularBrand);

// PATCH /api/popular-brands/:id/toggle-status - Toggle active/inactive
router.patch("/:id/toggle-status", togglePopularBrandStatus);

// DELETE /api/popular-brands/:id - Delete popular brand
router.delete("/:id", deletePopularBrand);

module.exports = router;
