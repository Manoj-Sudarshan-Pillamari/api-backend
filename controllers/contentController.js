const Content = require("../models/Content");
const cloudinary = require("../config/cloudinary");

// ============================================
// @desc    Save premium brand from admin form
// @route   POST /api/content
// @access  Public
// ============================================
exports.saveContent = async (req, res) => {
  try {
    const { brandName, description, type, rank, priority } = req.body;

    // ---- Validate all required fields ----
    if (
      !brandName ||
      !description ||
      !type ||
      !rank ||
      priority === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: brandName, description, type, rank, priority",
      });
    }

    // ---- Validate media file is uploaded ----
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image/Media file is required",
      });
    }

    // ---- Process uploaded file from Cloudinary ----
    const media = {
      url: req.file.path,
      publicId: req.file.filename,
      type: req.file.mimetype.startsWith("video")
        ? "video"
        : req.file.mimetype === "image/gif"
        ? "gif"
        : "image",
      filename: req.file.originalname,
    };

    // ---- Save to MongoDB ----
    const content = await Content.create({
      brandName,
      description,
      type,
      rank: Number(rank),
      priority: priority === "true" || priority === true,
      media,
    });

    res.status(201).json({
      success: true,
      message: "Premium Brand saved successfully",
      data: content,
    });
  } catch (error) {
    console.error("Save Error:", error);

    // Handle duplicate rank or validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error saving premium brand",
      error: error.message,
    });
  }
};

// ============================================
// @desc    Fetch all premium brands for user view
// @route   GET /api/content
// @access  Public
// ============================================
exports.fetchContent = async (req, res) => {
  try {
    // Sort by rank (ascending) and priority (true first)
    const content = await Content.find().sort({
      priority: -1,
      rank: 1,
    });

    res.status(200).json({
      success: true,
      count: content.length,
      data: content,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching premium brands",
      error: error.message,
    });
  }
};

// ============================================
// @desc    Fetch single premium brand by ID
// @route   GET /api/content/:id
// @access  Public
// ============================================
exports.fetchContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Premium Brand not found",
      });
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Fetch By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching premium brand",
      error: error.message,
    });
  }
};

// ============================================
// @desc    Update premium brand
// @route   PUT /api/content/:id
// @access  Public
// ============================================
exports.updateContent = async (req, res) => {
  try {
    const { brandName, description, type, rank, priority } = req.body;

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Premium Brand not found",
      });
    }

    // ---- Update fields ----
    content.brandName = brandName || content.brandName;
    content.description = description || content.description;
    content.type = type || content.type;
    content.rank = rank ? Number(rank) : content.rank;

    if (priority !== undefined) {
      content.priority = priority === "true" || priority === true;
    }

    // ---- If new media file is uploaded ----
    if (req.file) {
      // Delete old media from Cloudinary
      if (content.media && content.media.publicId) {
        try {
          const resourceType =
            content.media.type === "video" ? "video" : "image";
          await cloudinary.uploader.destroy(content.media.publicId, {
            resource_type: resourceType,
          });
          console.log(`🗑️ Old media deleted: ${content.media.publicId}`);
        } catch (cloudError) {
          console.error(`⚠️ Cloudinary delete error: ${cloudError.message}`);
        }
      }

      // Set new media
      content.media = {
        url: req.file.path,
        publicId: req.file.filename,
        type: req.file.mimetype.startsWith("video")
          ? "video"
          : req.file.mimetype === "image/gif"
          ? "gif"
          : "image",
        filename: req.file.originalname,
      };
    }

    const updatedContent = await content.save();

    res.status(200).json({
      success: true,
      message: "Premium Brand updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating premium brand",
      error: error.message,
    });
  }
};

// ============================================
// @desc    Delete premium brand
// @route   DELETE /api/content/:id
// @access  Public
// ============================================
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Premium Brand not found",
      });
    }

    // ---- Delete media from Cloudinary ----
    if (content.media && content.media.publicId) {
      try {
        const resourceType = content.media.type === "video" ? "video" : "image";
        await cloudinary.uploader.destroy(content.media.publicId, {
          resource_type: resourceType,
        });
        console.log(`🗑️ Deleted from Cloudinary: ${content.media.publicId}`);
      } catch (cloudError) {
        console.error(`⚠️ Cloudinary delete error: ${cloudError.message}`);
      }
    }

    // ---- Delete from MongoDB ----
    await Content.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Premium Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting premium brand",
      error: error.message,
    });
  }
};
