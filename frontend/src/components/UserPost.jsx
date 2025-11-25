import React from "react";
import { Link } from "react-router-dom";
import { useGetUserPostQuery } from "../slices/postApiSlice.js";
import { useGetCommentsQuery } from "../slices/commentApiSlice.js";
import { useLikeCommentMutation } from "../slices/commentApiSlice.js";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaShare,
  FaEye,
} from "react-icons/fa";
import { useLikePostMutation } from "../slices/postApiSlice.js";

const UserPost = () => {
  const { id } = useParams();
  
  const {
    data: posts,
    isLoading,
    refetch: refetchPosts,
  } = useGetUserPostQuery(id, {
    pollingInterval: 3000,
    refetchOnMountOrArgChange: true,
  });

  // Fetch all comments to count them per post
  const { data: allComments } = useGetCommentsQuery(undefined, {
    pollingInterval: 3000,
    refetchOnMountOrArgChange: true,
  });

  const [likePost] = useLikePostMutation();
  const [expandedImages, setExpandedImages] = React.useState({});
  const [localPosts, setLocalPosts] = React.useState([]);

  const { userInfo } = useSelector((state) => state.auth);

  // Sync fetched posts into local state
  React.useEffect(() => {
    if (posts) setLocalPosts(posts);
  }, [posts]);

  const getCommentCount = (postId) => {
    if (!allComments) return 0;
    return allComments.filter((comment) => comment.post === postId).length;
  };

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          text: "Thought you might like this",
          url: `${window.location.origin}/post/${postId}`,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(`${window.location.origin}/post/${postId}`)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch(() => {
          alert(
            "Share this link: " + `${window.location.origin}/post/${postId}`
          );
        });
    }
  };

  // ⭐ Optimistic Like
  const handleLike = async (postId) => {
    const updated = localPosts.map((p) => {
      if (p._id === postId) {
        const alreadyLiked = p.likedBy.includes(userInfo._id);

        return {
          ...p,
          likedBy: alreadyLiked
            ? p.likedBy.filter((id) => id !== userInfo._id)
            : [...p.likedBy, userInfo._id],
          like: alreadyLiked ? p.like - 1 : p.like + 1,
        };
      }
      return p;
    });

    setLocalPosts(updated); // update UI instantly

    try {
      await likePost(postId).unwrap();
    } catch (error) {
      console.error("Error liking post:", error);
      setLocalPosts(posts); // revert if backend fails
    }
  };

  const toggleImageExpand = (postId) => {
    setExpandedImages((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const isLiked = (post) => post.likedBy?.includes(userInfo?._id);
  const isOwnPost = (post) => post.user?._id === userInfo?._id;

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

  return (
    <div className="peak">
      {localPosts?.length === 0 ? (
        <div className="high" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>No posts yet</h2>
          <p>This user hasn't created any posts.</p>
        </div>
      ) : (
        localPosts?.map((post) => (
          <Link
            to={`/post/${post._id}`}
            className="high post-container"
            key={post._id}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <div className="profileSide">
              <div className="postProfile">
                <img src={post?.user?.profile || `/default-avatar.jpg`} alt="" />
                <div className="post-user-info">
                  <Link
                    to={`/profile/${post.user?._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: "none" }}
                  >
                    {post?.user?.username}
                  </Link>
                  <span className="post-time">{timeAgo(post.createdAt)}</span>
                </div>
              </div>

              {/* REMOVED FOLLOW/UNFOLLOW BUTTON - It's already in PictureSide */}
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

            {/* LIKE, COMMENT, SHARE, VIEWS */}
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
                  <p>{post.like || 0} </p>
                </button>
              </div>

              <div className="likes-count">
                <div className="icon-btn">
                  <FaRegComment className="icon" />
                  <p>{getCommentCount(post._id)}</p>
                </div>
              </div>

              <div className="likes-count">
                <div className="icon-btn">
                  <FaEye className="icon" />
                  <p>{post.views || 0} Views</p>
                </div>
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
        ))
      )}
    </div>
  );
};

export default UserPost;