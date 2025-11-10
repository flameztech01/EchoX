import React from 'react'
import { useGetOneAnonymousQuery } from '../slices/ghostApiSlice.js'
import { useLikeAnonymousMutation } from '../slices/ghostApiSlice.js';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {toast} from 'react-toastify';
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";

const Ghostid = () => {
    const { id } = useParams();
    const { data: post, isLoading, refetch } = useGetOneAnonymousQuery(id);
    const [likeAnonymous] = useLikeAnonymousMutation();
    
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

    const isLiked = (post) => {
        return localLikes[post._id] ?? post.likedBy?.includes(userId);
    };

    // Loading state - MOVED AFTER ALL HOOKS
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
                    <div className="postAction">
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
                            <Link to="/profile">Anonymous</Link>
                        </div>
                    </div>
                    <h2>{post.text}</h2>
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

export default Ghostid;