const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  savePopularBrand,
  fetchPopularBrands,
  fetchPopularBrandById,
  updatePopularBrand,
  deletePopularBrand,
} = require("../controllers/popularBrandController");

// POST /api/popular-brands - Save new popular brand
router.post("/", upload.single("media"), savePopularBrand);

// GET /api/popular-brands - Get all popular brands
router.get("/", fetchPopularBrands);

// GET /api/popular-brands/:id - Get single popular brand
router.get("/:id", fetchPopularBrandById);

// PUT /api/popular-brands/:id - Update popular brand
router.put("/:id", upload.single("media"), updatePopularBrand);

// DELETE /api/popular-brands/:id - Delete popular brand
router.delete("/:id", deletePopularBrand);

module.exports = router;
