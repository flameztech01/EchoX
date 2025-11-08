import React from 'react'
import { useGetOneAnonymousQuery } from '../slices/ghostApiSlice.js'
import { useLikeAnonymousMutation } from '../slices/ghostApiSlice.js';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'; // Add useEffect
import { useSelector } from 'react-redux';
import {toast} from 'react-toastify';

const Ghostid = () => {
    const { id } = useParams();
    const { data: post, refetch } = useGetOneAnonymousQuery(id);
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
    }, [post, userId]); // This runs when post data or userId changes

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
                            <input type="checkbox" id={`bookmark-${post._id}`} />
                            <label htmlFor={`bookmark-${post._id}`}>💬</label>
                            <Link to={`/anonymous/${post._id}`}>{post.comments} Comments</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Ghostid;