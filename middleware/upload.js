const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "admin-app";
    let resourceType = "image";

    // Determine resource type based on file
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    } else if (file.mimetype === "image/gif") {
      resourceType = "image";
    }

    return {
      folder: folder,
      resource_type: resourceType,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "mp4",
        "webm",
        "webp",
        "mov",
      ],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// File filter - only allow images, videos, gifs
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images, videos and GIFs are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max file size
  },
});

module.exports = upload;
