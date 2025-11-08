import React from 'react'
import { Link } from 'react-router-dom'
import { useRegisterMutation } from '../slices/userApiSlice.js'
import { useState } from 'react'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials } from '../slices/authSlice.js'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const [registerUser, {isLoading, error}] = useRegisterMutation();

  const userInfo = useSelector((state) => state.auth.userInfo);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


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
            <a href=""><img src="/google.png" alt="" />Google</a>
            <a href=""><img src="/facebook.png" alt="" />Facebook</a>
          </div>
          <p>Already have an account? <span><Link to="/signin">Sign In</Link></span></p>
      </form>
    </div>
  )
}

export default Signup
