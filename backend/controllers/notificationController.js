import express from "express";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";


// Helper function to generate notification messages
const getNotificationMessage = (type) => {
  const messages = {
    'like': 'liked your post',
    'comment': 'commented on your post',
    'follow': 'started following you',
    'mention': 'mentioned you in a comment',
    'reply': 'replied to your comment',
    'post_like': 'liked your post',
    'comment_like': 'liked your comment'
  };
  return messages[type] || 'sent you a notification';
};

// Get all notifications for the logged-in user
const getNotifications = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("notifications")
      .populate({
        path: "notifications.sender",
        select: "name username profile",
      })
      .populate({
        path: "notifications.post",
        select: "text images hashtag",
      })
      .populate({
        path: "notifications.comment",
        select: "content",
      });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Sort notifications by date (newest first)
    const sortedNotifications = user.notifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Mark as read if query parameter is present
    if (req.query.markAsRead === "true") {
      await User.findByIdAndUpdate(req.user._id, {
        $set: { "notifications.$[].isRead": true },
      });
    }

    res.status(200).json({
      success: true,
      count: sortedNotifications.length,
      unreadCount: sortedNotifications.filter((n) => !n.isRead).length,
      notifications: sortedNotifications,
    });
  } catch (error) {
    next(error);
  }
});

// Get unread notifications count
const getUnreadNotificationCount = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("notifications");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const unreadCount = user.notifications.filter(
      (notification) => !notification.isRead
    ).length;

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Find the notification and mark it as read
    const notification = user.notifications.id(notificationId);

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    notification.isRead = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
const markAllNotificationsAsRead = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Mark all notifications as read
    user.notifications.forEach((notification) => {
      notification.isRead = true;
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
});

// Clear all notifications
const clearAllNotifications = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Clear all notifications
    user.notifications = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    next(error);
  }
});

// Delete specific notification
const deleteNotification = asyncHandler(async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Remove the notification
    user.notifications = user.notifications.filter(
      (notification) => notification._id.toString() !== notificationId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to create notification (to be used in other controllers)
const createNotification = async (userId, notificationData) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    const notification = {
      type: notificationData.type,
      sender: notificationData.senderId,
      post: notificationData.postId || null,
      comment: notificationData.commentId || null,
      message: notificationData.message || "",
      isRead: false,
      createdAt: new Date(),
    };

    user.notifications.push(notification);

    // Limit notifications to 100 to prevent overflow
    if (user.notifications.length > 100) {
      user.notifications = user.notifications.slice(-100);
    }

    await user.save();

    // Populate sender info for real-time notifications
    const populatedNotification = await User.populate(notification, {
      path: "sender",
      select: "name username profile",
    });

    return populatedNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Get notification settings
const getNotificationSettings = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "notificationSettings"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      settings: user.notificationSettings || {
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        newFollowers: true,
        postLikes: true,
        commentLikes: true,
        emailNotifications: true,
        pushNotifications: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update notification settings
const updateNotificationSettings = asyncHandler(async (req, res, next) => {
  try {
    const { settings } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Merge new settings with existing ones
    user.notificationSettings = {
      ...user.notificationSettings,
      ...settings,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification settings updated",
      settings: user.notificationSettings,
    });
  } catch (error) {
    next(error);
  }
});

// Get recent notifications (for dropdown/notification bell)
const getRecentNotifications = asyncHandler(async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findById(req.user._id)
      .select("notifications")
      .populate({
        path: "notifications.sender",
        select: "name username profile",
      })
      .populate({
        path: "notifications.post",
        select: "text images hashtag",
      });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Get recent notifications (sorted by date, newest first)
    const recentNotifications = user.notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    // Count unread notifications
    const unreadCount = user.notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      count: recentNotifications.length,
      unreadCount,
      notifications: recentNotifications,
    });
  } catch (error) {
    next(error);
  }
});

export {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  deleteNotification,
  createNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getRecentNotifications,
};
