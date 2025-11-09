import React from 'react'
import { Link } from 'react-router-dom';
import { useGetPostsQuery } from '../slices/postApiSlice.js';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const Viewposts = () => {
  const {data: posts} = useGetPostsQuery();
  const {userInfo} = useSelector((state) => state.auth);
      const userId = userInfo?.id;

  return (
    <div>
      {posts?.map((post) => (
        <div className='high'>
             <div className="profileSide">
            <div className="postProfile">
                <img src={post?.user.profile} alt="" />
                <Link to={`/profile/${post.user._id}`}>{post?.user.username}</Link>
            </div>
            <div className="postFoll">
                <button type='follow'>Follow</button>
            </div>
      </div>
      <h2>{post.text}</h2>
      <img src={post.image} alt="" className='postImg'/>
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
      ))}
    </div>
  )
}

export default Viewposts
