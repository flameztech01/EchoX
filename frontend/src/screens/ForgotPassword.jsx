import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../slices/userApiSlice.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // In ForgotPassword.jsx - update the navigation
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await forgotPassword({ email }).unwrap();
    toast.success('OTP sent to your email');
    // Navigate to the password reset OTP page
    navigate('/send-password-otp', { 
      state: { 
        userId: response.userId, 
        email: email
      } 
    });
  } catch (error) {
    toast.error(error?.data?.message || 'Failed to send OTP');
  }
};

  return (
    <div className='back'>
      <form onSubmit={handleSubmit}>
        <img src="/logo.png" alt="Logo" />
        <h2>Reset Your Password</h2>
        <p>Enter your email address and we'll send you an OTP to reset your password.</p>
        
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your email'
          required
        />

        <button type='submit' disabled={isLoading}>
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </button>
        
        <p>Remember your password? <span><Link to="/signin">Sign In</Link></span></p>
      </form>
    </div>
  );
};

export default ForgotPassword;