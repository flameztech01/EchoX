import React from 'react'
import { Link } from 'react-router-dom'
import { setCredentials } from '../slices/authSlice.js'
import {useDispatch} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {useLoginMutation} from '../slices/userApiSlice.js'
import {toast} from 'react-toastify'
import {useSelector} from 'react-redux'
import {useState, useEffect} from 'react'
import { useGoogleAuthMutation } from '../slices/userApiSlice.js'
import { useGoogleLogin } from '@react-oauth/google';

const Signin = () => {
  const [loginUser, {isLoading, error}] = useLoginMutation();
  const [googleAuth] = useGoogleAuthMutation();
  const userInfo = useSelector((state) => state.auth.userInfo);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      const response = await googleAuth({
        token: tokenResponse.access_token // Send ID token instead of access token
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

  if(isLoading){
    return <h2>Loading...</h2>
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({email, password}).unwrap();
      dispatch(setCredentials({...res}));
      navigate('/home');
      toast.success('Login Successful');
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed');
    }
  }

  return (
    <div className='back'>
      <form onSubmit={handleSubmit}>
          <img src="/logo.png" alt="" />

           <input type="email" 
          name="" 
          onChange={(e) => setEmail(e.target.value)}
          placeholder='email'
          id="" 
          />

           <input type="password" 
          name="" 
          onChange={(e) => setPassword(e.target.value)}
          placeholder='password'
          id="" 
          />

          <a href="">Forget Password</a>

          <button type='submit'>Sign In</button>
          
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