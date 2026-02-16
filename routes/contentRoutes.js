const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  saveContent,
  fetchContent,
  fetchContentById,
  updateContent,
  deleteContent,
  toggleStatus,
} = require("../controllers/contentController");

// POST /api/content - Save new premium brand
router.post("/", upload.single("media"), saveContent);

// GET /api/content - Get all premium brands
router.get("/", fetchContent);

// GET /api/content/:id - Get single premium brand
router.get("/:id", fetchContentById);

// PUT /api/content/:id - Update premium brand
router.put("/:id", upload.single("media"), updateContent);

// PATCH /api/content/:id/toggle-status - Toggle active/inactive
router.patch("/:id/toggle-status", toggleStatus);

// DELETE /api/content/:id - Delete premium brand
router.delete("/:id", deleteContent);

module.exports = router;
