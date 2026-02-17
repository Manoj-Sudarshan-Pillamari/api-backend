const PopularBrand = require("../models/PopularBrand");
const cloudinary = require("../config/cloudinary");

exports.savePopularBrand = async (req, res) => {
  try {
    const { link, rank } = req.body;

    if (!link) {
      return res.status(400).json({
        success: false,
        message: "Link is required",
      });
    }

    if (!rank || Number(rank) < 1) {
      return res.status(400).json({
        success: false,
        message: "Rank is required and must be at least 1",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Media file is required",
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
      link,
      rank: Number(rank),
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
    const popularBrands = await PopularBrand.find().sort({ rank: 1 });

    res.status(200).json({
      success: true,
      count: popularBrands.length,
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
    const { link, rank } = req.body;

    const popularBrand = await PopularBrand.findById(req.params.id);

    if (!popularBrand) {
      return res.status(404).json({
        success: false,
        message: "Popular Brand not found",
      });
    }

    if (rank !== undefined && Number(rank) < 1) {
      return res.status(400).json({
        success: false,
        message: "Rank must be at least 1",
      });
    }

    popularBrand.link = link || popularBrand.link;
    popularBrand.rank = rank ? Number(rank) : popularBrand.rank;

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
