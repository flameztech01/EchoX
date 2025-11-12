import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  searchPost,
  userPosts,
  editPost,
  deletePost,
  likePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const router = express.Router();

//Cloudinary Configuration with lowercase unserscores
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "EchoX_posts",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "bmp",
      "tiff",
      "heif",
      "heic",
    ],
  },
});

const upload = multer({ storage });

cloudinary.api
  .ping()
  .then((result) => console.log("✅ Cloudinary connected successfully"))
  .catch((err) => console.error("Cloudinary not connected", err.message));

router.post("/upload", protect, upload.single("image"), createPost);
router.get("/", protect, getPosts);
router.get("/:id", protect, getPost);
router.get("/search/:text", protect, searchPost);
router.get("/user-post", protect, userPosts);
router.put("/edit-post", protect, editPost);
router.post("/delete", protect, deletePost);
router.patch("/:id/like", protect, likePost);

export default router;
