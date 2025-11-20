import React from 'react'
import { useGetOneAnonymousQuery } from '../slices/ghostApiSlice.js'
import { useLikeAnonymousMutation } from '../slices/ghostApiSlice.js';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaEye } from "react-icons/fa";

const Ghostid = () => {
    const { id } = useParams();
    const { data: post, isLoading, refetch } = useGetOneAnonymousQuery(id);
    const [likeAnonymous] = useLikeAnonymousMutation();
    
    const [localLikes, setLocalLikes] = useState({});
    const [isImageExpanded, setIsImageExpanded] = useState(false);
    
    const { userInfo } = useSelector((state) => state.auth);
    const userId = userInfo?._id;

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

    // Time ago function
    const timeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

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
            await refetch();
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

    // ⭐ Share functionality
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this anonymous post',
                    text: 'Thought you might like this',
                    url: `${window.location.origin}/anonymous/${post._id}`,
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${window.location.origin}/anonymous/${post._id}`)
                .then(() => {
                    alert('Link copied to clipboard!');
                })
                .catch(() => {
                    alert('Share this link: ' + `${window.location.origin}/anonymous/${post._id}`);
                });
        }
    };

    const toggleImageExpand = () => {
        setIsImageExpanded(!isImageExpanded);
    };

    const isLiked = (post) => {
        return localLikes[post._id] ?? post.likedBy?.includes(userId);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="Posts">
                <div className="high loading-skeleton">
                    <div className="profileSide">
                        <div className="postProfile">
                            <div className="skeleton-avatar"></div>
                            <div className="skeleton-text"></div>
                        </div>
                    </div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line" style={{width: '60%'}}></div>
                    <div className="skeleton-image"></div>
                    <div className="postAction">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='Posts'>
            {post && (
                <div key={post._id} className="high">
                    <div className="profileSide">
                        <div className="postProfile">
                            <img src="/ghost.jpg" alt="" />
                            <div className="post-user-info">
                                <span>Anonymous</span>
                                <span className="post-time">{timeAgo(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <h2>{post.text}</h2>

                    {post.image && (
                        <img
                            src={post.image}
                            alt=""
                            className={`postImg ${isImageExpanded ? "expanded" : ""}`}
                            onClick={toggleImageExpand}
                        />
                    )}

                    <div className="postAction">
                        <div className="likes-count">
                            <button 
                                className="icon-btn"
                                onClick={() => handleLike(post)}
                            >
                                {isLiked(post) ? (
                                    <FaHeart className="icon liked" />
                                ) : (
                                    <FaRegHeart className="icon" />
                                )}
                            </button>
                            <p>{post.like || 0}</p>
                        </div>

                        <div className="likes-count">
                            <div className="icon-btn">
                                <FaRegComment className="icon" />
                            </div>
                            <p>{post.comments?.length || 0}</p>
                        </div>

                        <div className="likes-count">
                            <div className="icon-btn">
                                <FaEye className="icon" />
                            </div>
                            <p>{post.views || 0} Views</p>
                        </div>

                        <div className="likes-count">
                            <button
                                className="icon-btn"
                                onClick={handleShare}
                            >
                                <FaShare className="icon" />
                                <p>Share</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Ghostid;