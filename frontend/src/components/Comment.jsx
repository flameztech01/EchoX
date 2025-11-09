import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetCommentsQuery } from '../slices/commentApiSlice.js';
import { useLikeCommentMutation } from '../slices/commentApiSlice.js';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify'

const Comment = () => {
    const {id} = useParams();
    const {data: comments, refetch} = useGetCommentsQuery(id, {
       pollingInterval: 1000, // Refetch every 1 second
      refetchOnFocus: true,
      refetchOnReconnect: true
    });
    const [likeComment] = useLikeCommentMutation();
      const [localLikes, setLocalLikes] = useState({}); // { postId: boolean }

    const {userInfo} = useSelector((state) => state.auth);
    const userId = userInfo?.id;

    useEffect(() => {
      refetch();
    })
    
     const handleLike = async (comment) => {
            const commentId = comment._id;
            const currentlyLiked = localLikes[commentId] ?? comment.likedBy?.includes(userId);
        
            // IMMEDIATE UI UPDATE
            setLocalLikes(prev => ({
              ...prev,
              [commentId]: !currentlyLiked
            }));
        
            try {
              await likeComment(commentId).unwrap();
              // Refetch to get updated counts from server
              await refetch();
            } catch (error) {
              console.error('Like failed:', error);
              toast.error(error.message || 'Failed to like the post.');
              // REVERT ON ERROR
              setLocalLikes(prev => ({
                ...prev,
                [commentId]: currentlyLiked // revert to previous state
              }));
            }
          };
        
          const isLiked = (comment) => {
            return localLikes[comment._id] ?? comment.likedBy?.includes(userId) ?? false;
          };
        
    
  return (
    <div className="comments-section">
      {comments?.map((comment) => (
         <div className='comment-card' key={comment._id}>
          <div className="comment-header">
            <div className="comment-profile">
                <img src={comment.author.profile || "/default-avatar.jpg"} alt="" />
                <Link to={`/profile/${comment.author._id}`} className="comment-username">{comment.author.username}</Link>
            </div>
            <button className="follow-btn">Follow</button>
          </div>
          <p className="comment-text">{comment.text}</p>
          <div className="comment-actions">
            <div className="action-item">
                 <input 
                type="checkbox" 
                onChange={() => handleLike(comment)}
                id={`heart-${comment._id}`}
                checked={!!isLiked(comment)}
              />
                <label htmlFor={`heart-${comment._id}`}>&#10084;</label>
                <span>{comment.like || 0}</span>
            </div>
            <div className="action-item">
                <input type="checkbox" id={`reply-${comment._id}`} />
                <label htmlFor={`reply-${comment._id}`}>💬</label>
                <Link to={`/comment/${comment._id}`}>Reply</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Comment;