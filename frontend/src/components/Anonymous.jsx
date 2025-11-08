import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetAnonymousQuery } from '../slices/ghostApiSlice.js'
import { useLikeAnonymousMutation } from '../slices/ghostApiSlice.js'
import {toast} from 'react-toastify';
import { useSelector } from 'react-redux';

const Anonymous = () => {
  const { data: anonymousPosts, refetch } = useGetAnonymousQuery({
     pollingInterval: 1000, // Refetch every 1 second
  refetchOnFocus: true,
  refetchOnReconnect: true
  });
  const [likeAnonymous] = useLikeAnonymousMutation();
  const [localLikes, setLocalLikes] = useState({}); // { postId: boolean }

  const { userInfo } = useSelector((state) => state.auth);
  const userId = userInfo?.id;

  useEffect(() => {
    refetch();
  });

  const handleLike = async (post) => {
    const postId = post._id;
    const currentlyLiked = localLikes[postId] ?? post.likedBy?.includes(userId);

    // IMMEDIATE UI UPDATE
    setLocalLikes(prev => ({
      ...prev,
      [postId]: !currentlyLiked
    }));

    try {
      await likeAnonymous(postId).unwrap();
      // Refetch to get updated counts from server

    } catch (error) {
      console.error('Like failed:', error);
      toast.error(error.message || 'Failed to like the post.');
      // REVERT ON ERROR
      setLocalLikes(prev => ({
        ...prev,
        [postId]: currentlyLiked // revert to previous state
      }));
    }
  };

  const isLiked = (post) => {
    return localLikes[post._id] ?? post.likedBy?.includes(userId);
  };

  return (
    <div className='Posts'>
      {anonymousPosts?.map((post) => (
        <div key={post._id} className="high">
          <div className="profileSide">
            <div className="postProfile">
              <img src="/ghost.jpg" alt="" />
              <Link to="/profile">Anonymous</Link>
            </div>
          </div>
          <h2>{post.text}</h2>
          <div className="postAction">
            <div className="likes-count">
              <input 
                type="checkbox" 
                onChange={() => handleLike(post)}
                id={`heart-${post._id}`}
                checked={isLiked(post)}
              />
              <label 
                htmlFor={`heart-${post._id}`}
                style={{ 
                  color: isLiked(post) ? 'red' : 'grey' 
                }}
              >
                &#10084;
              </label>
              <p>{post.like} Likes</p>
            </div>
            <div className="likes-count">
              <input type="checkbox" id={`bookmark-${post._id}`}  />
              <label htmlFor={`bookmark-${post._id}`}>💬</label>
              <Link to={`/anonymous/${post._id}`}>{post.comments} Comments</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Anonymous