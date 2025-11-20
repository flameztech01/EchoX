import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetCommentsQuery, useLikeCommentMutation } from '../slices/commentApiSlice.js';
import { useFollowUserMutation, useUnfollowUserMutation } from '../slices/userApiSlice.js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify'
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";

const Ghostcomment = () => {
    const {id} = useParams();
    const {data: comments} = useGetCommentsQuery(id, {
       pollingInterval: 1000,
      refetchOnFocus: true,
      refetchOnReconnect: true
    });
    
    const [likeAnonymous] = useLikeCommentMutation();
    const [followUser] = useFollowUserMutation();
    const [unfollowUser] = useUnfollowUserMutation();
    const {userInfo} = useSelector((state) => state.auth);

    // Local state for optimistic updates
    const [localComments, setLocalComments] = React.useState([]);

    // Sync fetched comments into local state
    React.useEffect(() => {
        if (comments) setLocalComments(comments);
    }, [comments]);

    // ⭐ Optimistic Like
    const handleLike = async (commentId) => {
        if (!userInfo) return;

        const previousComments = [...localComments];

        // Optimistic update
        const updated = localComments.map((comment) => {
            if (comment._id === commentId) {
                const alreadyLiked = comment.likedBy?.includes(userInfo._id);
                return {
                    ...comment,
                    likedBy: alreadyLiked
                        ? comment.likedBy.filter((id) => id !== userInfo._id)
                        : [...comment.likedBy, userInfo._id],
                    like: alreadyLiked ? (comment.like || 0) - 1 : (comment.like || 0) + 1,
                };
            }
            return comment;
        });

        setLocalComments(updated);

        try {
            await likeAnonymous(commentId).unwrap();
        } catch (error) {
            console.error('Like failed:', error);
            toast.error(error.message || 'Failed to like the comment.');
            // Revert on error
            setLocalComments(previousComments);
        }
    };

    // ⭐ Optimistic Follow/Unfollow
    const handleFollowToggle = async (userId, isFollowingNow) => {
        if (!userInfo) return;

        const previousComments = [...localComments];

        // Optimistic update
        const updated = localComments.map((comment) => {
            if (comment.author?._id === userId) {
                return {
                    ...comment,
                    author: {
                        ...comment.author,
                        followers: isFollowingNow
                            ? comment.author.followers.filter((id) => id !== userInfo._id)
                            : [...comment.author.followers, userInfo._id],
                    },
                };
            }
            return comment;
        });

        setLocalComments(updated);

        try {
            if (isFollowingNow) {
                await unfollowUser(userId).unwrap();
            } else {
                await followUser(userId).unwrap();
            }
        } catch (error) {
            console.error('Follow/Unfollow failed:', error);
            toast.error(error.message || `Failed to ${isFollowingNow ? 'unfollow' : 'follow'} user.`);
            // Revert on error
            setLocalComments(previousComments);
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
        {localComments?.map((comment) => (
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
                            onClick={() => handleFollowToggle(comment.author._id, true)}
                        >
                            Unfollow
                        </button>
                    ) : (
                        <button 
                            className="follow-btn"
                            onClick={() => handleFollowToggle(comment.author._id, false)}
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

export default Ghostcomment;