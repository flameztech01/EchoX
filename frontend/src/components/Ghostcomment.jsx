import React from "react";
import { useParams } from "react-router-dom";
import {
  useGetCommentsQuery,
  useLikeCommentMutation,
} from "../slices/commentApiSlice.js";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../slices/userApiSlice.js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CommentCard from "./CommentCard.jsx";

const Ghostcomment = () => {
  const { id } = useParams();
  const { data: comments } = useGetCommentsQuery(id, {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [likeComment] = useLikeCommentMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const { userInfo } = useSelector((state) => state.auth);

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
          like: alreadyLiked
            ? (comment.like || 0) - 1
            : (comment.like || 0) + 1,
        };
      }
      return comment;
    });

    setLocalComments(updated);

    try {
      await likeComment(commentId).unwrap();
    } catch (error) {
      console.error("Like failed:", error);
      toast.error(error.message || "Failed to like the comment.");
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
      console.error("Follow/Unfollow failed:", error);
      toast.error(
        error.message ||
          `Failed to ${isFollowingNow ? "unfollow" : "follow"} user.`
      );
      // Revert on error
      setLocalComments(previousComments);
    }
  };

  return (
    <div className="comments-section">
      {localComments?.map((comment) => (
        <CommentCard
          key={comment._id}
          comment={comment}
          onLike={handleLike}
          onFollowToggle={handleFollowToggle}
          showReplyButton={true}
        />
      ))}
    </div>
  );
};

export default Ghostcomment;