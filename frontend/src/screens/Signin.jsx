import React from 'react'
import { Link } from 'react-router-dom'
import { setCredentials } from '../slices/authSlice.js'
import {useDispatch} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {useLoginMutation} from '../slices/userApiSlice.js'
import {toast} from 'react-toastify'
import {useSelector} from 'react-redux'
import {useState, useEffect} from 'react'


const Signin = () => {
  const [loginUser, {isLoading, error}] = useLoginMutation();

  const userInfo = useSelector((state) => state.auth.userInfo);

  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
            <a href=""><img src="/google.png" alt="" />Google</a>
            <a href=""><img src="/facebook.png" alt="" />Facebook</a>
          </div>
          <p>Don't have an account? <span><Link to="/signup">Sign Up</Link></span></p>
      </form>
    </div>
  )
}

export default Signin
