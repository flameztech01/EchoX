import React from 'react'
import { Link } from 'react-router-dom'
import { useGetAnonymousQuery, useLikeAnonymousMutation } from '../slices/ghostApiSlice.js'
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";

const Anonymous = () => {
  // Add pollingInterval to refetch every 2 seconds
  const { data: anonymousPosts, isLoading, refetch } = useGetAnonymousQuery(undefined, {
    pollingInterval: 2000, // Refetch every 2 seconds
    refetchOnMountOrArgChange: true
  });
  
  const [likeAnonymous] = useLikeAnonymousMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Loading state
  if (isLoading) {
    return (
      <div className="Posts">
        {[...Array(3)].map((_, index) => (
          <div className="high loading-skeleton" key={index}>
            <div className="profileSide">
              <div className="postProfile">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line" style={{width: '60%'}}></div>
            <div className="postAction">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleLike = async (postId) => {
    console.log('Liking post:', postId);
    console.log('Current user ID:', userInfo?._id);
    
    try {
      const result = await likeAnonymous(postId).unwrap();
      console.log('Like API response:', result);
      // Remove refetch() - polling will handle it automatically
    } catch (error) {
      console.error('Like failed:', error);
      toast.error(error.message || 'Failed to like the post.');
    }
  };

  const isLiked = (post) => {
    console.log('=== CHECKING LIKE STATUS ===');
    console.log('Post ID:', post._id);
    console.log('User ID:', userInfo?._id);
    console.log('Post likedBy array:', post.likedBy);
    console.log('Is user in likedBy:', post.likedBy?.includes(userInfo?._id));
    
    return post.likedBy?.includes(userInfo?._id);
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
              <button 
                className="icon-btn"
                onClick={() => handleLike(post._id)}
              >
                {isLiked(post) ? (
                  <FaHeart className="icon liked"  />
                ) : (
                  <FaRegHeart className="icon" />
                )}
              </button>
              <p>{post.like || 0} Likes</p>
            </div>
            <div className="likes-count">
              <Link to={`/post/${post._id}`} className="icon-btn">
                <FaRegComment className="icon" />
              </Link>
              <Link to={`/anonymous/${post._id}`}>Comments</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Anonymous