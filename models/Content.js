const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: [true, "Premium Brand Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    type: {
      type: String,
      trim: true,
      default: "",
    },
    tile: {
      type: Number,
      required: [true, "Tile number is required"],
      min: [1, "Tile must be at least 1"],
      max: [28, "Tile cannot exceed 28"],
    },
    rank: {
      type: Number,
      default: 0,
      min: [0, "Rank cannot be negative"],
    },
    priority: {
      type: Boolean,
      required: [true, "Priority is required"],
      default: false,
    },
    autoplaySpeed: {
      type: Number,
      default: 3000,
      min: [1000, "Minimum autoplay speed is 1000ms"],
      max: [30000, "Maximum autoplay speed is 30000ms"],
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    media: {
      url: {
        type: String,
        required: [true, "Image/Media URL is required"],
      },
      publicId: {
        type: String,
      },
      type: {
        type: String,
        enum: ["image", "video", "gif"],
      },
      filename: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Content", contentSchema);
