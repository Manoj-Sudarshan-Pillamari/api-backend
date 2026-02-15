const Content = require("../models/Content");
const cloudinary = require("../config/cloudinary");

exports.saveContent = async (req, res) => {
  try {
    const {
      brandName,
      description,
      type,
      tile,
      rank,
      priority,
      autoplaySpeed,
      link,
    } = req.body;

    const isPriority = priority === "true" || priority === true;

    if (
      !brandName ||
      !description ||
      !tile ||
      !link ||
      priority === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: brandName, description, tile, link, priority",
      });
    }

    if (Number(tile) < 1 || Number(tile) > 28) {
      return res.status(400).json({
        success: false,
        message: "Tile must be between 1 and 28",
      });
    }

    if (isPriority && (!rank || Number(rank) < 1)) {
      return res.status(400).json({
        success: false,
        message: "Rank must be at least 1 when priority is enabled",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image/Media file is required",
      });
    }

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

    const content = await Content.create({
      brandName,
      description,
      type: type || "",
      tile: Number(tile),
      rank: isPriority ? Number(rank) : 0,
      priority: isPriority,
      autoplaySpeed: autoplaySpeed ? Number(autoplaySpeed) : 3000,
      link,
      media,
    });

    res.status(201).json({
      success: true,
      message: "Premium Brand saved successfully",
      data: content,
    });
  } catch (error) {
    console.error("Save Error:", error);

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

exports.fetchContent = async (req, res) => {
  try {
    const content = await Content.find().sort({
      tile: 1,
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

exports.updateContent = async (req, res) => {
  try {
    const {
      brandName,
      description,
      type,
      tile,
      rank,
      priority,
      autoplaySpeed,
      link,
    } = req.body;

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Premium Brand not found",
      });
    }

    const isPriority =
      priority !== undefined
        ? priority === "true" || priority === true
        : content.priority;

    if (isPriority && rank !== undefined && Number(rank) < 1) {
      return res.status(400).json({
        success: false,
        message: "Rank must be at least 1 when priority is enabled",
      });
    }

    if (tile !== undefined && (Number(tile) < 1 || Number(tile) > 28)) {
      return res.status(400).json({
        success: false,
        message: "Tile must be between 1 and 28",
      });
    }

    content.brandName = brandName || content.brandName;
    content.description = description || content.description;
    content.type = type !== undefined ? type : content.type;
    content.tile = tile ? Number(tile) : content.tile;
    content.priority = isPriority;
    content.rank = isPriority ? (rank ? Number(rank) : content.rank) : 0;
    content.autoplaySpeed = autoplaySpeed
      ? Number(autoplaySpeed)
      : content.autoplaySpeed;
    content.link = link || content.link;

    if (req.file) {
      if (content.media && content.media.publicId) {
        try {
          const resourceType =
            content.media.type === "video" ? "video" : "image";
          await cloudinary.uploader.destroy(content.media.publicId, {
            resource_type: resourceType,
          });
        } catch (cloudError) {
          console.error("Cloudinary delete error:", cloudError.message);
        }
      }

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

exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Premium Brand not found",
      });
    }

    if (content.media && content.media.publicId) {
      try {
        const resourceType = content.media.type === "video" ? "video" : "image";
        await cloudinary.uploader.destroy(content.media.publicId, {
          resource_type: resourceType,
        });
      } catch (cloudError) {
        console.error("Cloudinary delete error:", cloudError.message);
      }
    }

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
