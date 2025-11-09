import React from 'react'
import { useGetOnePostQuery } from '../slices/postApiSlice.js';
import { useLikePostMutation } from '../slices/postApiSlice.js';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

const Postid = () => {
  const { id } = useParams();
  const { data: post, isLoading, refetch } = useGetOnePostQuery(id);
  const [likePost] = useLikePostMutation();

  const [localLikes, setLocalLikes] = useState({});
  const { userInfo } = useSelector((state) => state.auth);
  const userId = userInfo?.id;

  // Initialize localLikes when post data loads
  useEffect(() => {
    if (post && userId) {
      const isCurrentlyLiked = post.likedBy?.includes(userId);
      setLocalLikes(prev => ({
        ...prev,
        [post._id]: isCurrentlyLiked
      }));
    }
  }, [post, userId]);

  const handleLike = async (postId) => {
    const currentlyLiked = localLikes[postId] ?? post.likedBy?.includes(userId);

    // IMMEDIATE UI UPDATE
    setLocalLikes(prev => ({
      ...prev,
      [postId]: !currentlyLiked
    }));

    try {
      await likePost(postId).unwrap();
      await refetch();
    } catch (error) {
      console.error('Like failed:', error);
      toast.error(error.message || 'Failed to like the post.');
      setLocalLikes(prev => ({
        ...prev,
        [postId]: currentlyLiked
      }));
    }
  };

  const isLiked = (post) => {
    return localLikes[post._id] ?? post.likedBy?.includes(userId);
  };

  // Loading state - moved to AFTER all hooks
  if (isLoading) {
    return (
      <div className="peak">
        <div className="high loading-skeleton">
          <div className="profileSide">
            <div className="postProfile">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text"></div>
            </div>
            <div className="skeleton-button" style={{width: '80px'}}></div>
          </div>
          <div className="skeleton-line"></div>
          <div className="skeleton-image"></div>
          <div className="postAction">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='peak'>
      {post && (
        <div className='high' key={post._id}>
          <div className="profileSide">
            <div className="postProfile">
              <img src={post?.user?.profile || `/default-avatar.jpg`} alt="" />
              <Link to={`/profile/${post.user?._id}`}>{post?.user?.username}</Link>
            </div>
            <div className="postFoll">
              <button type='follow'>Follow</button>
            </div>
          </div>
          <h2>{post.text}</h2>
          <img src={post.image} alt="" className='postImg'/>
          <div className="postAction">
            <div className="likes-count">
              <input 
                type="checkbox" 
                id={`heart-${post._id}`} 
                checked={isLiked(post)}
                onChange={() => handleLike(post._id)}
              />
              <label htmlFor={`heart-${post._id}`}>&#10084;</label>
              <p>{post.like || 0} Likes</p>
            </div>
            <div className="likes-count">
              <input type="checkbox" id={`bookmark-${post._id}`} />
              <label htmlFor={`bookmark-${post._id}`}>💬</label>
              <Link to={`/post/${post._id}`}>Comments</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Postid