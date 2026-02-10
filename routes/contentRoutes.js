const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  saveContent,
  fetchContent,
  fetchContentById,
  updateContent,
  deleteContent,
} = require("../controllers/contentController");

// POST   /api/content      - Save new premium brand (single file upload)
router.post("/", upload.single("media"), saveContent);

// GET    /api/content      - Get all premium brands
router.get("/", fetchContent);

// GET    /api/content/:id  - Get single premium brand
router.get("/:id", fetchContentById);

// PUT    /api/content/:id  - Update premium brand (single file upload)
router.put("/:id", upload.single("media"), updateContent);

// DELETE /api/content/:id  - Delete premium brand
router.delete("/:id", deleteContent);

module.exports = router;
