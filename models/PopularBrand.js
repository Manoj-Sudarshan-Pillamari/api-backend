const mongoose = require("mongoose");

const popularBrandSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: [true, "Link is required"],
      trim: true,
    },
    rank: {
      type: Number,
      required: [true, "Rank is required"],
      unique: true,
      min: [1, "Rank must be at least 1"],
    },
    media: {
      url: {
        type: String,
        required: [true, "Media URL is required"],
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

module.exports = mongoose.model("PopularBrand", popularBrandSchema);
