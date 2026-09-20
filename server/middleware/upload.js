import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

export const uploadImages = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 6 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(ApiError.badRequest("Only JPEG, PNG, or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

export function uploadBufferToCloudinary(buffer, { folder }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}
