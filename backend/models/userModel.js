import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    profile: { type: String, default: "" },
    bio: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    darkMode: {
      type: Boolean,
      default: false,
    },
    // OTP Verification Fields
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    },
    // Password Reset Fields - ADD THESE
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    authMethod: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },
    // Social Auth Fields
    googleId: {
      type: String,
      default: null
    },
    facebookId: {
      type: String,
      default: null
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    
    // NOTIFICATION FIELDS - ADDED HERE
    notifications: [
      {
        type: {
          type: String,
          enum: [
            'like',
            'comment',
            'follow',
            'mention',
            'post_like',
            'comment_like',
            'new_follower',
            'system'
          ],
          required: true
        },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post'
        },
        comment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Comment'
        },
        message: {
          type: String
        },
        isRead: {
          type: Boolean,
          default: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    
    notificationSettings: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      newFollowers: { type: Boolean, default: true },
      postLikes: { type: Boolean, default: true },
      commentLikes: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true }
    },
    
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Add indexes for better performance with notifications
userSchema.index({ 'notifications.createdAt': -1 });
userSchema.index({ 'notifications.isRead': 1 });
userSchema.index({ email: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(7);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add method to add notification (optional)
userSchema.methods.addNotification = async function (notificationData) {
  const notification = {
    type: notificationData.type,
    sender: notificationData.senderId,
    post: notificationData.postId || null,
    comment: notificationData.commentId || null,
    message: notificationData.message || '',
    isRead: false,
    createdAt: new Date()
  };

  this.notifications.push(notification);
  
  // Limit notifications to 100 to prevent overflow
  if (this.notifications.length > 100) {
    this.notifications = this.notifications.slice(-100);
  }
  
  await this.save();
  return notification;
};

// Add method to mark all notifications as read
userSchema.methods.markAllNotificationsAsRead = async function () {
  this.notifications.forEach(notification => {
    notification.isRead = true;
  });
  await this.save();
};

// Add method to get unread count
userSchema.methods.getUnreadNotificationCount = function () {
  return this.notifications.filter(notification => !notification.isRead).length;
};

// Add method to get recent notifications
userSchema.methods.getRecentNotifications = function (limit = 10) {
  return this.notifications
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

const User = mongoose.model("User", userSchema);

export default User;