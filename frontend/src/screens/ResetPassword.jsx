import React, { useState } from 'react';
import { useResetPasswordMutation } from '../slices/userApiSlice.js';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get userId and resetToken from location state
  const { userId, resetToken } = location.state || {};

  React.useEffect(() => {
    if (!userId || !resetToken) {
      toast.error('Invalid access');
      navigate('/forgot-password');
    }
  }, [userId, resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await resetPassword({
        userId,
        newPassword,
        confirmPassword,
        resetToken
      }).unwrap();

      toast.success('Password reset successfully!');
      navigate('/signin');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className='back'>
      <form onSubmit={handleSubmit}>
        <img src="/logo.png" alt="Logo" />
        <h2>Create New Password</h2>
        <p>Enter your new password below.</p>
        
        <input 
          type="password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder='New Password'
          required
          minLength="6"
        />

        <input 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm New Password'
          required
          minLength="6"
        />

        <button type='submit' disabled={isLoading}>
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </button>
        
        <p>Remember your password? <span><Link to="/signin">Sign In</Link></span></p>
      </form>
    </div>
  );
};

export default ResetPassword;