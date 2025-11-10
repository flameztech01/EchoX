import React from 'react'
import { useGetOnePostQuery, useLikePostMutation } from '../slices/postApiSlice.js';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";

const Postid = () => {
  const { id } = useParams();
  const { data: post, isLoading, refetch } = useGetOnePostQuery(id);
  const [likePost] = useLikePostMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const handleLike = async (postId) => {
    try {
      await likePost(postId).unwrap();
      await refetch(); // Refresh to get updated like status from server
    } catch (error) {
      console.error('Like failed:', error);
      toast.error(error.message || 'Failed to like the post.');
    }
  };

  const isLiked = (post) => {
    return post.likedBy?.includes(userInfo?._id);
  };

  // Loading state
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
              <button 
                className="icon-btn"
                onClick={() => handleLike(post._id)}
              >
                {isLiked(post) ? (
                  <FaHeart className="icon liked" />
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
              <Link to={`/post/${post._id}`}>Comments</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Postid