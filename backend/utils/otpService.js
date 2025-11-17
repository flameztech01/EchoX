// utils/otpService.js
import nodemailer from 'nodemailer';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp) => {
  try {
    console.log('=== PRODUCTION OTP SEND ===');
    console.log('To:', email);
    console.log('OTP:', otp);
    console.log('Gmail User:', process.env.EMAIL_USER);
    
    // Remove any spaces from password
    const emailPass = process.env.EMAIL_PASS.replace(/\s+/g, '');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: emailPass,
      },
      // Production settings
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });

    const mailOptions = {
      from: `EchoX <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your EchoX Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>EchoX Verification Code</h2>
          <p>Your OTP code is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <hr>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('=== OTP SENT SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('=== GMAIL OTP FAILED ===');
    console.error('Error:', error.message);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Check your Gmail app password.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Cannot connect to Gmail. Check your network connection.');
    } else {
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }
};

export { generateOTP, sendOTP };