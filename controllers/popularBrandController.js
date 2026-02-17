const PopularBrand = require("../models/PopularBrand");
const cloudinary = require("../config/cloudinary");

exports.savePopularBrand = async (req, res) => {
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
      startDateTime,
      endDateTime,
      status,
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

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        success: false,
        message: "Start date-time and End date-time are required",
      });
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date-time format",
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "End date-time must be after start date-time",
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

    // Check duplicate rank only when priority is enabled — same tile + same rank + priority
    if (isPriority) {
      const existingRank = await PopularBrand.findOne({
        tile: Number(tile),
        rank: Number(rank),
        priority: true,
      });
      if (existingRank) {
        return res.status(400).json({
          success: false,
          message: `Rank ${rank} already exists in Tile ${tile} with priority. Please provide a unique rank value.`,
        });
      }
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

    const popularBrand = await PopularBrand.create({
      brandName,
      description,
      type: type || "",
      tile: Number(tile),
      rank: isPriority ? Number(rank) : 0,
      priority: isPriority,
      autoplaySpeed: autoplaySpeed ? Number(autoplaySpeed) : 3000,
      link,
      startDateTime: startDate,
      endDateTime: endDate,
      status: status || "active",
      media,
    });

    res.status(201).json({
      success: true,
      message: "Popular Brand saved successfully",
      data: popularBrand,
    });
  } catch (error) {
    console.error("Save Popular Brand Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error saving popular brand",
      error: error.message,
    });
  }
};

exports.fetchPopularBrands = async (req, res) => {
  try {
    const popularBrands = await PopularBrand.find().sort({
      tile: 1,
      priority: -1,
      rank: 1,
    });

    res.status(200).json({
      success: true,
      count: popularBrands.length,
      tileCount: 8,
      data: popularBrands,
    });
  } catch (error) {
    console.error("Fetch Popular Brands Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching popular brands",
      error: error.message,
    });
  }
};

exports.fetchActivePopularBrands = async (req, res) => {
  try {
    const now = new Date();

    const popularBrands = await PopularBrand.find({
      status: "active",
      startDateTime: { $lte: now },
      endDateTime: { $gte: now },
    }).sort({
      tile: 1,
      priority: -1,
      rank: 1,
    });

    res.status(200).json({
      success: true,
      count: popularBrands.length,
      tileCount: 8,
      data: popularBrands,
    });
  } catch (error) {
    console.error("Fetch Active Popular Brands Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching active popular brands",
      error: error.message,
    });
  }
};

exports.fetchPopularBrandById = async (req, res) => {
  try {
    const popularBrand = await PopularBrand.findById(req.params.id);

    if (!popularBrand) {
      return res.status(404).json({
        success: false,
        message: "Popular Brand not found",
      });
    }

    res.status(200).json({
      success: true,
      data: popularBrand,
    });
  } catch (error) {
    console.error("Fetch Popular Brand By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching popular brand",
      error: error.message,
    });
  }
};

exports.updatePopularBrand = async (req, res) => {
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
      startDateTime,
      endDateTime,
      status,
    } = req.body;

    const popularBrand = await PopularBrand.findById(req.params.id);

    if (!popularBrand) {
      return res.status(404).json({
        success: false,
        message: "Popular Brand not found",
      });
    }

    const isPriority =
      priority !== undefined
        ? priority === "true" || priority === true
        : popularBrand.priority;

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

    // Check duplicate rank only when priority is enabled — same tile + same rank + priority (exclude self)
    if (isPriority && rank !== undefined) {
      const checkTile = tile ? Number(tile) : popularBrand.tile;
      const existingRank = await PopularBrand.findOne({
        tile: checkTile,
        rank: Number(rank),
        priority: true,
        _id: { $ne: req.params.id },
      });
      if (existingRank) {
        return res.status(400).json({
          success: false,
          message: `Rank ${rank} already exists in Tile ${checkTile} with priority. Please provide a unique rank value.`,
        });
      }
    }

    const newStart = startDateTime
      ? new Date(startDateTime)
      : popularBrand.startDateTime;
    const newEnd = endDateTime
      ? new Date(endDateTime)
      : popularBrand.endDateTime;

    if (startDateTime && isNaN(newStart.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date-time format",
      });
    }

    if (endDateTime && isNaN(newEnd.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date-time format",
      });
    }

    if (newEnd <= newStart) {
      return res.status(400).json({
        success: false,
        message: "End date-time must be after start date-time",
      });
    }

    popularBrand.brandName = brandName || popularBrand.brandName;
    popularBrand.description = description || popularBrand.description;
    popularBrand.type = type !== undefined ? type : popularBrand.type;
    popularBrand.tile = tile ? Number(tile) : popularBrand.tile;
    popularBrand.priority = isPriority;
    popularBrand.rank = isPriority
      ? rank
        ? Number(rank)
        : popularBrand.rank
      : 0;
    popularBrand.autoplaySpeed = autoplaySpeed
      ? Number(autoplaySpeed)
      : popularBrand.autoplaySpeed;
    popularBrand.link = link || popularBrand.link;
    popularBrand.startDateTime = newStart;
    popularBrand.endDateTime = newEnd;
    popularBrand.status = status !== undefined ? status : popularBrand.status;

    if (req.file) {
      if (popularBrand.media && popularBrand.media.publicId) {
        try {
          const resourceType =
            popularBrand.media.type === "video" ? "video" : "image";
          await cloudinary.uploader.destroy(popularBrand.media.publicId, {
            resource_type: resourceType,
          });
        } catch (cloudError) {
          console.error("Cloudinary delete error:", cloudError.message);
        }
      }

      popularBrand.media = {
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

    const updatedPopularBrand = await popularBrand.save();

    res.status(200).json({
      success: true,
      message: "Popular Brand updated successfully",
      data: updatedPopularBrand,
    });
  } catch (error) {
    console.error("Update Popular Brand Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating popular brand",
      error: error.message,
    });
  }
};

exports.togglePopularBrandStatus = async (req, res) => {
  try {
    const popularBrand = await PopularBrand.findById(req.params.id);

    if (!popularBrand) {
      return res.status(404).json({
        success: false,
        message: "Popular Brand not found",
      });
    }

    popularBrand.status =
      popularBrand.status === "active" ? "inactive" : "active";
    const updatedPopularBrand = await popularBrand.save();

    res.status(200).json({
      success: true,
      message: `Status changed to ${updatedPopularBrand.status}`,
      data: updatedPopularBrand,
    });
  } catch (error) {
    console.error("Toggle Popular Brand Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling status",
      error: error.message,
    });
  }
};

exports.deletePopularBrand = async (req, res) => {
  try {
    const popularBrand = await PopularBrand.findById(req.params.id);

    if (!popularBrand) {
      return res.status(404).json({
        success: false,
        message: "Popular Brand not found",
      });
    }

    if (popularBrand.media && popularBrand.media.publicId) {
      try {
        const resourceType =
          popularBrand.media.type === "video" ? "video" : "image";
        await cloudinary.uploader.destroy(popularBrand.media.publicId, {
          resource_type: resourceType,
        });
      } catch (cloudError) {
        console.error("Cloudinary delete error:", cloudError.message);
      }
    }

    await PopularBrand.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Popular Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete Popular Brand Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting popular brand",
      error: error.message,
    });
  }
};
