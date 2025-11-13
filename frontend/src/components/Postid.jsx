import React from "react";
import {
  useGetOnePostQuery,
  useLikePostMutation,
} from "../slices/postApiSlice.js";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
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

  const handleLike = async (postId) => {
    try {
      await likePost(postId).unwrap();
      await refetch();
    } catch (error) {
      console.error("Like failed:", error);
      toast.error(error.message || "Failed to like the post.");
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId).unwrap();
      await refetch();
    } catch (error) {
      console.error("Follow failed:", error);
      toast.error(error.message || "Failed to follow user.");
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId).unwrap();
      await refetch();
    } catch (error) {
      console.error("Unfollow failed:", error);
      toast.error(error.message || "Failed to unfollow user.");
    }
  };

  const toggleImageExpand = (postId) => {
    setExpandedImages((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const isLiked = (post) => {
    return post.likedBy?.includes(userInfo?._id);
  };

  const isOwnPost = (post) => {
    return post.user?._id === userInfo?._id;
  };

  const isFollowing = (post) => {
    return post.user?.followers?.includes(userInfo?._id);
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="peak">
      {post && (
        <div className="high" key={post._id}>
          <div className="profileSide">
            <div className="postProfile">
              <img src={post?.user?.profile || `/default-avatar.jpg`} alt="" />
              <Link to={`/profile/${post.user?._id}`}>
                {post?.user?.username}
              </Link>
            </div>
            <div className="postFoll">
              {!isOwnPost(post) &&
                userInfo &&
                (isFollowing(post) ? (
                  <button
                    type="button"
                    onClick={() => handleUnfollow(post.user?._id)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFollow(post.user?._id)}
                  >
                    Follow
                  </button>
                ))}
            </div>
          </div>
          <h2>{post.text}</h2>
          <img
            src={post.image}
            alt=""
            className={`postImg ${expandedImages[post._id] ? "expanded" : ""}`}
            onClick={() => toggleImageExpand(post._id)}
          />
          <div className="postAction">
            <div className="likes-count">
              <button className="icon-btn" onClick={() => handleLike(post._id)}>
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
  );
};

export default Postid;
