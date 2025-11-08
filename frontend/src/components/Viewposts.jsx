import React from 'react'
import { Link } from 'react-router-dom'

const Viewposts = () => {
  return (
    <div className='high'>
      <div className="profileSide">
            <div className="postProfile">
                <img src="/mountain.jpg" alt="" />
                <Link to="/profile">Json Peterson</Link>
            </div>
            <div className="postFoll">
                <button type='follow'>Follow</button>
            </div>
      </div>
      <h2>The sunshine is really amazing</h2>
      <img src="/mountain.jpg" alt="" className='postImg'/>
      <div className="postAction">
          <div className="likes-count">
                <input type="checkbox" id='heart' />
                <label htmlFor='heart'>&#10084;</label>
                <p>3k Likes</p>
          </div>
        <div className="likes-count">
            <input type="checkbox" id='bookmark' />
            <label htmlFor='bookmark'>💬</label>
            <Link to="/post/:id">2k Comments</Link>
        </div>
      </div>
    </div>
  )
}

export default Viewposts
