import React from 'react'
import { Link } from 'react-router-dom';

const Bottombar = () => {
  return (
    <div className='bottomBar'>
      
        <Link to="/home"><img src="https://img.icons8.com/?size=100&id=2797&format=png&color=FFFFFF" alt="" /></Link>
        <Link to="/anonymous"><img src="https://img.icons8.com/?size=100&id=102439&format=png&color=FFFFFF" alt="" /></Link>
        <Link to="/postForm" className='plus'><img src="https://img.icons8.com/?size=100&id=1501&format=png&color=FFFFFF" alt="" /></Link>
        <Link to="/profile"><img src="https://img.icons8.com/?size=100&id=99268&format=png&color=FFFFFF" alt="" /></Link>
        <Link to="/settings"><img src="https://img.icons8.com/?size=100&id=2969&format=png&color=FFFFFF" alt="" /></Link>

    </div>
  )
} 

export default Bottombar
