import React from "react";
import { Link } from "react-router-dom";
import {
  useGetAnonymousQuery,
  useLikeAnonymousMutation,
} from "../slices/ghostApiSlice.js";
import { useGetCommentsQuery } from "../slices/commentApiSlice.js";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaEye } from "react-icons/fa";

const Anonymous = () => {
  const {
    data: anonymousPosts,
    isLoading,
    refetch,
  } = useGetAnonymousQuery(undefined, {
    pollingInterval: 3000,
    refetchOnMountOrArgChange: true,
  });

  const [likeAnonymous] = useLikeAnonymousMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Local state for optimistic updates
  const [localPosts, setLocalPosts] = React.useState([]);
  const [expandedImages, setExpandedImages] = React.useState({});

  // Sync fetched posts into local state
  React.useEffect(() => {
    if (anonymousPosts) setLocalPosts(anonymousPosts);
  }, [anonymousPosts]);

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

  // ⭐ Optimistic Like
  const handleLike = async (postId) => {
    if (!userInfo) return;

    const previousPosts = [...localPosts];

    // Optimistic update
    const updated = localPosts.map((post) => {
      if (post._id === postId) {
        const alreadyLiked = post.likedBy?.includes(userInfo._id);
        return {
          ...post,
          likedBy: alreadyLiked
            ? post.likedBy.filter((id) => id !== userInfo._id)
            : [...post.likedBy, userInfo._id],
          like: alreadyLiked ? (post.like || 0) - 1 : (post.like || 0) + 1,
        };
      }
      return post;
    });

    setLocalPosts(updated);

    try {
      await likeAnonymous(postId).unwrap();
    } catch (error) {
      console.error("Like failed:", error);
      toast.error(error.message || "Failed to like the post.");
      // Revert on error
      setLocalPosts(previousPosts);
    }
  };

  // ⭐ Share functionality
  const handleShare = async (postId) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this anonymous post',
          text: 'Thought you might like this',
          url: `${window.location.origin}/anonymous/${postId}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/anonymous/${postId}`)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(() => {
          alert('Share this link: ' + `${window.location.origin}/anonymous/${postId}`);
        });
    }
  };

  const toggleImageExpand = (postId) => {
    setExpandedImages((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Get comments for each post to display count
  const { data: allComments } = useGetCommentsQuery(undefined, {
    pollingInterval: 3000,
  });

  // Function to get comment count for a specific post
  const getCommentCount = (postId) => {
    if (!allComments) return 0;
    return allComments.filter((comment) => comment.post === postId).length;
  };

  const isLiked = (post) => {
    return post.likedBy?.includes(userInfo?._id);
  };

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
            <div className="skeleton-line" style={{ width: "60%" }}></div>
            <div className="skeleton-image"></div>
            <div className="postAction">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="Posts">
      {localPosts?.map((post) => (
        <Link
          to={`/anonymous/${post._id}`}
          className="high post-container"
          key={post._id}
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
        >
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
              className={`postImg ${expandedImages[post._id] ? "expanded" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleImageExpand(post._id);
              }}
            />
          )}

          <div className="postAction">
            <div className="likes-count">
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleLike(post._id);
                }}
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
              <p>{getCommentCount(post._id)}</p>
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
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleShare(post._id);
                }}
              >
                <FaShare className="icon" />
                <p>Share</p>
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Anonymous;