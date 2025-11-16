// utils/otpService.js
import nodemailer from 'nodemailer';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: `Your OTP code is: <strong>${otp}</strong>`
  });
};

export { generateOTP, sendOTP };