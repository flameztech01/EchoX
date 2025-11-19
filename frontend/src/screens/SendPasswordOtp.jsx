import React, { useState, useRef, useEffect } from 'react';
import { useSendOtpMutation, useResendOtpMutation } from '../slices/userApiSlice.js';
import { useVerifyResetOTPMutation } from '../slices/userApiSlice.js';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const SendPasswordOtp = () => {
  const [sendOtp] = useSendOtpMutation(); // For resending OTP
  const [verifyResetOTP, { isLoading }] = useVerifyResetOTPMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get userId and email from location state
  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      toast.error('Invalid access');
      navigate('/forgot-password');
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, userId, email, navigate]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      
      const lastFilledIndex = Math.min(newOtp.length - 1, 5);
      if (inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex].focus();
      }
    }
  };

  const handleVerifyOtp = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    try {
      const result = await verifyResetOTP({ 
        userId, 
        otp: otpValue 
      }).unwrap();
      
      toast.success('OTP verified successfully!');
      
      // Navigate to reset password page with reset token
      navigate('/reset-password', { 
        state: { 
          userId: result.userId,
          resetToken: result.resetToken
        } 
      });
    } catch (error) {
      toast.error(error?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      // Use the same resendOtp mutation as signin/signup
      await resendOtp({ userId }).unwrap();
      setTimeLeft(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('New OTP sent to your email');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="back">
      <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
        <div className="otp-container">
          <h2 className="otp-title">Verify OTP for Password Reset</h2>
          <p className="otp-subtitle">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <div className="otp-inputs-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`otp-input ${digit ? 'filled' : ''}`}
            />
          ))}
        </div>

        <button 
          type="submit" 
          disabled={isLoading || otp.join('').length !== 6}
          className="otp-verify-btn"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="otp-resend-container">
          <p className="otp-resend-text">
            Didn't receive the code?{' '}
            {timeLeft > 0 ? (
              <span className="otp-timer">Resend in {timeLeft}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="otp-resend-btn"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </p>
        </div>

        <div className="otp-note">
          <p className="otp-note-text">
            📧 Check your spam folder if you don't see the email
          </p>
        </div>
      </form>
    </div>
  );
};

export default SendPasswordOtp;