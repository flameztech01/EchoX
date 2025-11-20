import React from "react";
import { Link } from "react-router-dom";
import {
  useGetAnonymousQuery,
  useLikeAnonymousMutation,
} from "../slices/ghostApiSlice.js";
import { useGetCommentsQuery } from "../slices/commentApiSlice.js";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";

const Anonymous = () => {
  // Add pollingInterval to refetch every 2 seconds
  const {
    data: anonymousPosts,
    isLoading,
    refetch,
  } = useGetAnonymousQuery(undefined, {
    pollingInterval: 3000, // Refetch every 3 seconds
    refetchOnMountOrArgChange: true,
  });

  const [likeAnonymous] = useLikeAnonymousMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Local state for optimistic updates
  const [localPosts, setLocalPosts] = React.useState([]);

  // Sync fetched posts into local state
  React.useEffect(() => {
    if (anonymousPosts) setLocalPosts(anonymousPosts);
  }, [anonymousPosts]);

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
            <div className="postAction">
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
              <span>Anonymous</span>
            </div>
          </div>
          <h2>{post.text}</h2>
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
              <p>{post.like || 0} Likes</p>
            </div>
            <div className="likes-count">
              <div className="icon-btn">
                <FaRegComment className="icon" />
              </div>
              <p>{getCommentCount(post._id)} Comments</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Anonymous;
