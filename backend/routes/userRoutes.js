import express from "express";
import {
  googleAuth,
  verifyOTP,
  resendOTP,
  loginUser,
  registerUser,
  updateDarkMode,
  getUserProfile,
  getAnyUserProfile,
  updateProfile,
  logoutUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendResetOTP,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStats,
  search,
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

// ===== AUTHENTICATION ROUTES =====
router.post("/google", googleAuth);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);

// ===== FORGOT PASSWORD ROUTES =====
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.post("/resend-reset-otp", resendResetOTP);

// ===== PROTECTED USER PROFILE ROUTES =====
router.put("/dark-mode", protect, updateDarkMode);
router.get("/profile", protect, getUserProfile);
router.get("/profile/:id", protect, getAnyUserProfile);
router.put("/update-profile", protect, upload.single("image"), updateProfile);
router.delete("/delete", protect, deleteUser);

// ===== FOLLOW/UNFOLLOW ROUTES =====
router.post("/follow/:id", protect, followUser);
router.post("/unfollow/:id", protect, unfollowUser);

// ===== FOLLOWERS/FOLLOWING ROUTES =====
router.get("/followers", protect, getFollowers); // current user
router.get("/followers/:id", protect, getFollowers); // specific user

router.get("/following", protect, getFollowing); // current user
router.get("/following/:id", protect, getFollowing); // specific user

router.get("/follow-stats", protect, getFollowStats); // current user
router.get("/follow-stats/:id", protect, getFollowStats); // specific user

router.get("/search", protect, search);

export default router;