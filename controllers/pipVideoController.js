const PipVideo = require("../models/PipVideo");
const cloudinary = require("../config/cloudinary");

exports.savePipVideo = async (req, res) => {
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

    const existingRank = await PipVideo.findOne({ rank: Number(rank) });
    if (existingRank) {
      return res.status(400).json({
        success: false,
        message: `Rank ${rank} is already assigned to another video. Please use a unique rank.`,
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

    const pipVideo = await PipVideo.create({
      link,
      rank: Number(rank),
      media,
    });

    res.status(201).json({
      success: true,
      message: "PiP Video saved successfully",
      data: pipVideo,
    });
  } catch (error) {
    console.error("Save PiP Video Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error saving PiP video",
      error: error.message,
    });
  }
};

exports.fetchPipVideos = async (req, res) => {
  try {
    const pipVideos = await PipVideo.find().sort({ rank: 1 });

    res.status(200).json({
      success: true,
      count: pipVideos.length,
      data: pipVideos,
    });
  } catch (error) {
    console.error("Fetch PiP Videos Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching PiP videos",
      error: error.message,
    });
  }
};

exports.fetchPipVideoById = async (req, res) => {
  try {
    const pipVideo = await PipVideo.findById(req.params.id);

    if (!pipVideo) {
      return res.status(404).json({
        success: false,
        message: "PiP Video not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pipVideo,
    });
  } catch (error) {
    console.error("Fetch PiP Video By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching PiP video",
      error: error.message,
    });
  }
};

exports.updatePipVideo = async (req, res) => {
  try {
    const { link, rank } = req.body;

    const pipVideo = await PipVideo.findById(req.params.id);

    if (!pipVideo) {
      return res.status(404).json({
        success: false,
        message: "PiP Video not found",
      });
    }

    if (rank !== undefined && Number(rank) < 1) {
      return res.status(400).json({
        success: false,
        message: "Rank must be at least 1",
      });
    }

    if (rank !== undefined) {
      const existingRank = await PipVideo.findOne({
        rank: Number(rank),
        _id: { $ne: req.params.id },
      });
      if (existingRank) {
        return res.status(400).json({
          success: false,
          message: `Rank ${rank} is already assigned to another video. Please use a unique rank.`,
        });
      }
    }

    pipVideo.link = link || pipVideo.link;
    pipVideo.rank = rank ? Number(rank) : pipVideo.rank;

    if (req.file) {
      if (pipVideo.media && pipVideo.media.publicId) {
        try {
          const resourceType =
            pipVideo.media.type === "video" ? "video" : "image";
          await cloudinary.uploader.destroy(pipVideo.media.publicId, {
            resource_type: resourceType,
          });
        } catch (cloudError) {
          console.error("Cloudinary delete error:", cloudError.message);
        }
      }

      pipVideo.media = {
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

    const updatedPipVideo = await pipVideo.save();

    res.status(200).json({
      success: true,
      message: "PiP Video updated successfully",
      data: updatedPipVideo,
    });
  } catch (error) {
    console.error("Update PiP Video Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating PiP video",
      error: error.message,
    });
  }
};

exports.deletePipVideo = async (req, res) => {
  try {
    const pipVideo = await PipVideo.findById(req.params.id);

    if (!pipVideo) {
      return res.status(404).json({
        success: false,
        message: "PiP Video not found",
      });
    }

    if (pipVideo.media && pipVideo.media.publicId) {
      try {
        const resourceType =
          pipVideo.media.type === "video" ? "video" : "image";
        await cloudinary.uploader.destroy(pipVideo.media.publicId, {
          resource_type: resourceType,
        });
      } catch (cloudError) {
        console.error("Cloudinary delete error:", cloudError.message);
      }
    }

    await PipVideo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "PiP Video deleted successfully",
    });
  } catch (error) {
    console.error("Delete PiP Video Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting PiP video",
      error: error.message,
    });
  }
};
