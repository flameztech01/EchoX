// utils/sendOTP.js

import { Resend } from "resend";

// Initialize Resend client using environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email using Resend
export const sendOTP = async (email, otp) => {
  try {
    console.log("=== SENDING OTP VIA RESEND ===");

    const data = await resend.emails.send({
     from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your OTP Code</h2>
          <p>Your verification code is:</p>
          <h1 style="color:#4F46E5; font-size: 32px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    console.log("=== OTP SENT SUCCESSFULLY ===");
    return data;

  } catch (error) {
    console.error("❌ OTP EMAIL FAILED:", error);
    throw new Error("Failed to send OTP email");
  }
};

