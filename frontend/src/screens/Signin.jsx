import React from 'react'
import { Link } from 'react-router-dom'
import { setCredentials } from '../slices/authSlice.js'
import {useDispatch} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {useLoginMutation} from '../slices/userApiSlice.js'
import {toast} from 'react-toastify'
import {useState} from 'react'
import { useGoogleAuthMutation } from '../slices/userApiSlice.js'
import { useGoogleLogin } from '@react-oauth/google';
import SendOtp from './SendOtp.jsx'

const Signin = () => {
  const [loginUser, {isLoading}] = useLoginMutation();
  const [googleAuth] = useGoogleAuthMutation();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [userId, setUserId] = useState('');

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await googleAuth({
          token: tokenResponse.access_token
        }).unwrap();
        
        dispatch(setCredentials({...response}));
        navigate('/home');
        toast.success('Login Successful');
      } catch (error) {
        toast.error(error?.data?.message || 'Google login failed');
      }
    },
    onError: () => {
      toast.error('Google login failed');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({email, password}).unwrap();
      
      if (res.requiresOTP) {
        setRequiresOTP(true);
        setUserId(res.userId);
      } else {
        dispatch(setCredentials({...res}));
        navigate('/home');
        toast.success('Login Successful');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed');
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
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='email'
            required
          />

          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='password'
            required
          />

          <Link to="/forgot-password">Forget Password</Link>

          <button type='submit' disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <div className="signup_options">
            <button type="button" onClick={handleGoogleSignIn}>
              <img src="/google.png" alt="" />Google
            </button>
            <button type="button"><img src="/facebook.png" alt="" />Facebook</button>
          </div>
          <p>Don't have an account? <span><Link to="/signup">Sign Up</Link></span></p>
      </form>
    </div>
  )
}

export default Signin