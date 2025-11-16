import React from 'react'
import { Link } from 'react-router-dom'
import { useRegisterMutation } from '../slices/userApiSlice.js'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials } from '../slices/authSlice.js'
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleAuthMutation } from '../slices/userApiSlice.js';
import SendOtp from './SendOtp.jsx'

const Signup = () => {
  const [registerUser, {isLoading}] = useRegisterMutation();
  const [googleAuth] = useGoogleAuthMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [userId, setUserId] = useState('');

  const handleGoogleSignUp = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await googleAuth({
          token: tokenResponse.access_token
        }).unwrap();
        
        dispatch(setCredentials({...response}));
        navigate('/home');
        toast.success('Registration Successful');
      } catch (error) {
        toast.error(error?.data?.message || 'Google registration failed');
      }
    },
    onError: () => {
      toast.error('Google registration failed');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser({name, email, username, password}).unwrap();
      
      if (res.requiresOTP) {
        setRequiresOTP(true);
        setUserId(res.userId);
      } else {
        dispatch(setCredentials({...res}));
        navigate('/home');
        toast.success('Registration Successful');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Registration failed');
    }
  }

  if (requiresOTP) {
    return <SendOtp userId={userId} email={email} />
  }

  return (
    <div className='back'>
      <form onSubmit={handleSubmit}>
          <img src="/logo.png" alt="" />
          
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='fullname'
            required
          />

          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='email'
            required
          />

          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='username'
            required
          />

          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='password'
            required
          />

          <button type='submit' disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <div className="signup_options">
            <button type="button" onClick={handleGoogleSignUp}>
              <img src="/google.png" alt="" />Google
            </button>
            <button type="button">
              <img src="/facebook.png" alt="" />Facebook
            </button>
          </div>
          <p>Already have an account? <span><Link to="/signin">Sign In</Link></span></p>
      </form>
    </div>
  )
}

export default Signup