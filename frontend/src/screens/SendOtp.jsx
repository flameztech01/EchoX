import React, { useState, useRef, useEffect } from 'react';
import { useSendOtpMutation } from '../slices/userApiSlice.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../slices/authSlice.js';

const SendOtp = ({ userId, email }) => {
  const [sendOtp, { isLoading }] = useSendOtpMutation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Add this

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

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
      const result = await sendOtp({ userId, otp: otpValue }).unwrap();
      
      console.log('OTP Response:', result);
      
      if (result.token) {
        // Add this line to store credentials in Redux
        dispatch(setCredentials({...result}));
        toast.success('Email verified successfully!');
        navigate('/home');
      } else {
        toast.error('No token received');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtp({ userId }).unwrap();
      setTimeLeft(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('New OTP sent to your email');
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="back">
      <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
        <div className="otp-container">
          <h2 className="otp-title">Verify Your Email</h2>
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
                disabled={isLoading}
                className="otp-resend-btn"
              >
                Resend OTP
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

export default SendOtp;