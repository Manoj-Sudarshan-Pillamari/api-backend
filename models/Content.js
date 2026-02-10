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
      required: [true, "Type is required"],
      trim: true,
    },
    rank: {
      type: Number,
      required: [true, "Rank is required"],
      min: [1, "Rank must be at least 1"],
    },
    priority: {
      type: Boolean,
      required: [true, "Priority is required"],
      default: false,
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
