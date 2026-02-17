const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  savePipVideo,
  fetchPipVideos,
  fetchPipVideoById,
  updatePipVideo,
  deletePipVideo,
} = require("../controllers/pipVideoController");

// POST /api/pip-videos - Save new PiP video
router.post("/", upload.single("media"), savePipVideo);

// GET /api/pip-videos - Get all PiP videos
router.get("/", fetchPipVideos);

// GET /api/pip-videos/:id - Get single PiP video
router.get("/:id", fetchPipVideoById);

// PUT /api/pip-videos/:id - Update PiP video
router.put("/:id", upload.single("media"), updatePipVideo);

// DELETE /api/pip-videos/:id - Delete PiP video
router.delete("/:id", deletePipVideo);

module.exports = router;
