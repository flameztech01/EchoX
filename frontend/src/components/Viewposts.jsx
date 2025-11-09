import React from 'react'
import { Link } from 'react-router-dom';
import { useGetPostsQuery, useLikePostMutation } from '../slices/postApiSlice.js';
import { useSelector } from 'react-redux';

const Viewposts = () => {
  const { data: posts, isLoading, refetch } = useGetPostsQuery();
  const [likePost] = useLikePostMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Loading state
  if (isLoading) {
    return (
      <div className="peak">
        {[...Array(3)].map((_, index) => (
          <div className="high loading-skeleton" key={index}>
            <div className="profileSide">
              <div className="postProfile">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>
            <div className="skeleton-line"></div>
            <div className="skeleton-image"></div>
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
    try {
      await likePost(postId).unwrap();
      refetch();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const isLiked = (post) => {
    return post.likedBy?.includes(userInfo?._id);
  };

  return (
    <div className='peak'>
      {posts?.map((post) => (
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
      ))}
    </div>
  )
}

export default Viewposts