import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetCommentsQuery, useLikeCommentMutation } from '../slices/commentApiSlice.js';
import { useFollowUserMutation, useUnfollowUserMutation } from '../slices/userApiSlice.js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify'
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";

const Comment = () => {
    const {id} = useParams();
    const {data: comments} = useGetCommentsQuery(id, {
       pollingInterval: 1000,
      refetchOnFocus: true,
      refetchOnReconnect: true
    });
    
    const [likeComment] = useLikeCommentMutation();
    const [followUser] = useFollowUserMutation();
    const [unfollowUser] = useUnfollowUserMutation();
    const {userInfo} = useSelector((state) => state.auth);

    const handleLike = async (commentId) => {
        try {
            await likeComment(commentId).unwrap();
        } catch (error) {
            console.error('Like failed:', error);
            toast.error(error.message || 'Failed to like the comment.');
        }
    };

    const handleFollow = async (userId) => {
        try {
            await followUser(userId).unwrap();
        } catch (error) {
            console.error('Follow failed:', error);
            toast.error(error.message || 'Failed to follow user.');
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await unfollowUser(userId).unwrap();
        } catch (error) {
            console.error('Unfollow failed:', error);
            toast.error(error.message || 'Failed to unfollow user.');
        }
    };

    const isLiked = (comment) => {
        return comment.likedBy?.includes(userInfo?._id);
    };

    const isOwnComment = (comment) => {
        return comment.author?._id === userInfo?._id;
    };

    const isFollowing = (comment) => {
        return comment.author?.followers?.includes(userInfo?._id);
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
                {!isOwnComment(comment) && userInfo && (
                    isFollowing(comment) ? (
                        <button 
                            className="follow-btn"
                            onClick={() => handleUnfollow(comment.author._id)}
                        >
                            Unfollow
                        </button>
                    ) : (
                        <button 
                            className="follow-btn"
                            onClick={() => handleFollow(comment.author._id)}
                        >
                            Follow
                        </button>
                    )
                )}
            </div>
            <p className="comment-text">{comment.text}</p>
            <div className="comment-actions">
                <div className="action-item">
                <button 
                    className="icon-btn"
                    onClick={() => handleLike(comment._id)}
                >
                    {isLiked(comment) ? (
                    <FaHeart className="icon liked" />
                    ) : (
                    <FaRegHeart className="icon" />
                    )}
                </button>
                <span>{comment.like || 0}</span>
                </div>
                <div className="action-item">
                <Link to={`/comment/${comment._id}`} className="icon-btn">
                    <FaRegComment className="icon" />
                </Link>
                <Link to={`/comment/${comment._id}`}>Reply</Link>
                </div>
            </div>
            </div>
        ))}
        </div>
    )
}

export default Comment;