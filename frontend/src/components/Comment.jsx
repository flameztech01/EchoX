import React from 'react'
import { Link } from 'react-router-dom'
import Viewposts from './Viewposts.jsx'
import Navbar from './Navbar.jsx'

const Comment = () => {
  return (
    <div className="low">
        <Navbar />
        <Viewposts />
    <div className='high-comment'>
      <div className="profileSide">
            <div className="postProfile">
                <img src="/logo.png" alt="" />
                <Link to="/profile">Json Peterson</Link>
            </div>
            <div className="postFoll">
                <button type='follow'>Follow</button>
            </div>
      </div>
      <h2>The sunshine is really amazing</h2>
      <div className="postAction">
        <div className="likes-count">
                       <input type="checkbox" id='heart' />
                       <label htmlFor='heart'>&#10084;</label>
                       <p>3k Likes</p>
                 </div>
               <div className="likes-count">
                   <input type="checkbox" id='bookmark' />
                   <label htmlFor='bookmark'>💬</label>
                   <Link to="/comment/:id">2k Replies</Link>
               </div>
      </div>
    </div>
    </div>
  )
}

export default Comment
