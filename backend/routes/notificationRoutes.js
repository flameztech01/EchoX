import express from "express";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getRecentNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All notification routes are protected
router.use(protect);

// Get all notifications
router.get("/", getNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadNotificationCount);

// Get recent notifications (for dropdown/notification bell)
router.get("/recent", getRecentNotifications);

// Get notification settings
router.get("/settings", getNotificationSettings);

// Update notification settings
router.put("/settings", updateNotificationSettings);

// Mark specific notification as read
router.put("/:notificationId/read", markNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", markAllNotificationsAsRead);

// Delete specific notification
router.delete("/:notificationId", deleteNotification);

// Clear all notifications
router.delete("/", clearAllNotifications);

export default router;