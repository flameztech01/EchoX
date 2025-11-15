import express from "express";
import {
  googleAuth,
  loginUser,
  registerUser,
  updateDarkMode,
  getUserProfile,
  getAnyUserProfile,
  updateProfile,
  logoutUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStats,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

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
    folder: "EchoX_users",
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

router.post("/google", googleAuth);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.put("/dark-mode", protect, updateDarkMode);
router.get("/profile", protect, getUserProfile);
router.get("/profile/:id", protect, getAnyUserProfile);
router.put("/update-profile", protect, upload.single("image"), updateProfile);
router.post("/logout", logoutUser);
router.delete('/delete', protect, deleteUser);

router.post("/follow/:id", protect, followUser);
router.post("/unfollow/:id", protect, unfollowUser);

// Followers
router.get("/followers", protect, getFollowers); // current user
router.get("/followers/:id", protect, getFollowers); // specific user

// Following
router.get("/following", protect, getFollowing); // current user
router.get("/following/:id", protect, getFollowing); // specific user

// Follow stats
router.get("/follow-stats", protect, getFollowStats); // current user
router.get("/follow-stats/:id", protect, getFollowStats); // specific user
// :id is optional, defaults to current user

export default router;
