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
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

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

const User = mongoose.model("User", userSchema);

export default User;