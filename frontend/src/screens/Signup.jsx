import React from 'react'
import { Link } from 'react-router-dom'
import { useRegisterMutation } from '../slices/userApiSlice.js'
import { useState } from 'react'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials } from '../slices/authSlice.js'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleAuthMutation } from '../slices/userApiSlice.js'

const Signup = () => {
  const [registerUser, {isLoading, error}] = useRegisterMutation();
  const [googleAuth] = useGoogleAuthMutation();

  const userInfo = useSelector((state) => state.auth.userInfo);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
      dispatch(setCredentials({...res}));
      navigate('/home');
      toast.success('Registration Successful');
    } catch (error) {
      toast.error(error?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className='back'>
      <form onSubmit={handleSubmit}>
          <img src="/logo.png" alt="" />
          <input type="text" 
          name="" 
          onChange={(e) => setName(e.target.value)}
          placeholder='fullname'
          id="" 
          />

           <input type="email" 
          name="" 
          onChange={(e) => setEmail(e.target.value)}
          placeholder='email'
          id="" 
          />

           <input type="text" 
          name="" 
          onChange={(e) => setUsername(e.target.value)}
          placeholder='username'
          id="" 
          />

           <input type="password" 
          name="" 
          onChange={(e) => setPassword(e.target.value)}
          placeholder='password'
          id="" 
          />

          <button type='submit'>Sign Up</button>
          
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