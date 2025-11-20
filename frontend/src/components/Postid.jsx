import React from "react";
import {
  useGetOnePostQuery,
  useLikePostMutation,
} from "../slices/postApiSlice.js";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaEye } from "react-icons/fa";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../slices/userApiSlice.js";

const Postid = () => {
  const { id } = useParams();
  const { data: post, isLoading, refetch } = useGetOnePostQuery(id);
  const [likePost] = useLikePostMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [expandedImages, setExpandedImages] = React.useState({});
  const { userInfo } = useSelector((state) => state.auth);

  // Local state for optimistic updates
  const [localPost, setLocalPost] = React.useState(null);

  // Sync fetched post into local state
  React.useEffect(() => {
    if (post) setLocalPost(post);
  }, [post]);

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

  // ⭐ Share functionality
  const handleShare = async (postId) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          text: 'Thought you might like this',
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success('Link copied to clipboard!');
        })
        .catch(() => {
          // Final fallback: show URL
          toast.info(`Share this link: ${shareUrl}`);
        });
    }
  };

  // ⭐ Optimistic Like
  const handleLike = async (postId) => {
    if (!localPost || !userInfo) return;

    const previousPost = { ...localPost };

    // Optimistic update
    const updatedPost = {
      ...localPost,
      likedBy: isLiked(localPost)
        ? localPost.likedBy.filter((id) => id !== userInfo._id)
        : [...localPost.likedBy, userInfo._id],
      like: isLiked(localPost) ? localPost.like - 1 : localPost.like + 1,
    };

    setLocalPost(updatedPost);

    try {
      await likePost(postId).unwrap();
      // Optionally refetch to ensure sync with server
      await refetch();
    } catch (error) {
      console.error("Like failed:", error);
      toast.error(error.message || "Failed to like the post.");
      // Revert on error
      setLocalPost(previousPost);
    }
  };

  // ⭐ Optimistic Follow/Unfollow
  const handleFollowToggle = async (userId, isFollowingNow) => {
    if (!localPost || !userInfo) return;

    const previousPost = { ...localPost };

    // Optimistic update
    const updatedPost = {
      ...localPost,
      user: {
        ...localPost.user,
        followers: isFollowingNow
          ? localPost.user.followers.filter((id) => id !== userInfo._id)
          : [...localPost.user.followers, userInfo._id],
      },
    };

    setLocalPost(updatedPost);

    try {
      if (isFollowingNow) {
        await unfollowUser(userId).unwrap();
      } else {
        await followUser(userId).unwrap();
      }
      // Optionally refetch to ensure sync with server
      await refetch();
    } catch (error) {
      console.error("Follow/Unfollow failed:", error);
      toast.error(error.message || `Failed to ${isFollowingNow ? 'unfollow' : 'follow'} user.`);
      // Revert on error
      setLocalPost(previousPost);
    }
  };

  const toggleImageExpand = (postId) => {
    setExpandedImages((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const isLiked = (post) => {
    return post?.likedBy?.includes(userInfo?._id);
  };

  const isOwnPost = (post) => {
    return post?.user?._id === userInfo?._id;
  };

  const isFollowing = (post) => {
    return post?.user?.followers?.includes(userInfo?._id);
  };

  if (isLoading) {
    return (
      <div className="peak">
        <div className="high loading-skeleton">
          <div className="profileSide">
            <div className="postProfile">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text"></div>
            </div>
            <div className="skeleton-button" style={{ width: "80px" }}></div>
          </div>
          <div className="skeleton-line"></div>
          <div className="skeleton-image"></div>
          <div className="postAction">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    );
  }

  // Use localPost for rendering if available, otherwise fall back to post
  const displayPost = localPost || post;

  return (
    <div className="peak">
      {displayPost && (
        <div className="high" key={displayPost._id}>
          <div className="profileSide">
            <div className="postProfile">
              <img src={displayPost?.user?.profile || `/default-avatar.jpg`} alt="" />
              <div className="post-user-info">
                <Link to={`/profile/${displayPost.user?._id}`}>
                  {displayPost?.user?.username}
                </Link>
                <span className="post-time">{timeAgo(displayPost.createdAt)}</span>
              </div>
            </div>
            <div className="postFoll">
              {!isOwnPost(displayPost) &&
                userInfo &&
                (isFollowing(displayPost) ? (
                  <button
                    type="button"
                    onClick={() => handleFollowToggle(displayPost.user?._id, true)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFollowToggle(displayPost.user?._id, false)}
                  >
                    Follow
                  </button>
                ))}
            </div>
          </div>
          <h2>{displayPost.text}</h2>
          <img
            src={displayPost.image}
            alt=""
            className={`postImg ${expandedImages[displayPost._id] ? "expanded" : ""}`}
            onClick={() => toggleImageExpand(displayPost._id)}
          />
          <div className="postAction">
            <div className="likes-count">
              <button className="icon-btn" onClick={() => handleLike(displayPost._id)}>
                {isLiked(displayPost) ? (
                  <FaHeart className="icon liked" />
                ) : (
                  <FaRegHeart className="icon" />
                )}
              </button>
              <p>{displayPost.like || 0}</p>
            </div>
            <div className="likes-count">
              <div className="icon-btn">
                <FaRegComment className="icon" />
              </div>
              <p>{displayPost.comments?.length || 0}</p>
            </div>
          
            <div className="likes-count">
              <div className="icon-btn">
                <FaEye className="icon" />
              </div>
              <p>{displayPost.views || 0}</p>
            </div>

            <div className="likes-count">
              <button className="icon-btn" onClick={() => handleShare(displayPost._id)}>
                <FaShare className="icon" />
                <p>Share</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Postid;