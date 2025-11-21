import React from "react";
import { useParams } from "react-router-dom";
import { 
  useGetCommentThreadQuery, 
  useLikeCommentMutation 
} from "../slices/commentApiSlice.js";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../slices/userApiSlice.js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CommentCard from "./CommentCard.jsx";
import Ghostcommentform from "./Ghostcommentform.jsx";
import CommentNav from "./CommentNav.jsx";

const Commentid = () => {
  const { id } = useParams(); // comment ID
  const { data: threadData, isLoading, refetch } = useGetCommentThreadQuery(id, {
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [likeComment] = useLikeCommentMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Local state for optimistic updates
  const [localThread, setLocalThread] = React.useState(null);

  // Sync fetched thread into local state
  React.useEffect(() => {
    if (threadData) setLocalThread(threadData);
  }, [threadData]);

  // ⭐ Optimistic Like for comments and replies
  const handleLike = async (commentId) => {
    if (!userInfo || !localThread) return;

    const previousThread = { ...localThread };

    // Optimistic update for main comment
    if (localThread.comment?._id === commentId) {
      const updatedComment = {
        ...localThread.comment,
        likedBy: isLiked(localThread.comment)
          ? localThread.comment.likedBy.filter((id) => id !== userInfo._id)
          : [...localThread.comment.likedBy, userInfo._id],
        like: isLiked(localThread.comment) 
          ? (localThread.comment.like || 0) - 1 
          : (localThread.comment.like || 0) + 1,
      };

      setLocalThread({
        ...localThread,
        comment: updatedComment
      });
    } 
    // Optimistic update for replies
    else {
      const updatedReplies = localThread.replies.map((reply) => {
        if (reply._id === commentId) {
          const alreadyLiked = reply.likedBy?.includes(userInfo._id);
          return {
            ...reply,
            likedBy: alreadyLiked
              ? reply.likedBy.filter((id) => id !== userInfo._id)
              : [...reply.likedBy, userInfo._id],
            like: alreadyLiked
              ? (reply.like || 0) - 1
              : (reply.like || 0) + 1,
          };
        }
        return reply;
      });

      setLocalThread({
        ...localThread,
        replies: updatedReplies
      });
    }

    try {
      await likeComment(commentId).unwrap();
    } catch (error) {
      console.error("Like failed:", error);
      toast.error(error.message || "Failed to like the comment.");
      // Revert on error
      setLocalThread(previousThread);
    }
  };

  // ⭐ Optimistic Follow/Unfollow
  const handleFollowToggle = async (userId, isFollowingNow) => {
    if (!userInfo || !localThread) return;

    const previousThread = { ...localThread };

    // Update follow status in main comment
    if (localThread.comment?.author?._id === userId) {
      const updatedComment = {
        ...localThread.comment,
        author: {
          ...localThread.comment.author,
          followers: isFollowingNow
            ? localThread.comment.author.followers.filter((id) => id !== userInfo._id)
            : [...localThread.comment.author.followers, userInfo._id],
        },
      };

      setLocalThread({
        ...localThread,
        comment: updatedComment
      });
    }

    // Update follow status in replies
    const updatedReplies = localThread.replies.map((reply) => {
      if (reply.author?._id === userId) {
        return {
          ...reply,
          author: {
            ...reply.author,
            followers: isFollowingNow
              ? reply.author.followers.filter((id) => id !== userInfo._id)
              : [...reply.author.followers, userInfo._id],
          },
        };
      }
      return reply;
    });

    setLocalThread({
      ...localThread,
      replies: updatedReplies
    });

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
      setLocalThread(previousThread);
    }
  };

  // Helper function to check if a comment is liked
  const isLiked = (comment) => {
    return comment?.likedBy?.includes(userInfo?._id);
  };

  if (isLoading) return <div>Loading thread...</div>;

  // Use localThread for rendering if available, otherwise fall back to threadData
  const displayThread = localThread || threadData;

  return (
    <div>
      <CommentNav />
      <div className="comment-thread-page">
        {/* Original comment */}
        {displayThread?.comment && (
          <CommentCard
            comment={displayThread.comment}
            onLike={handleLike}
            onFollowToggle={handleFollowToggle}
            showReplyButton={true}
            showOptions={true}
          />
        )}
        
        {/* Replies with proper nesting */}
        {displayThread?.replies?.length > 0 && (
          <div className="replies-section">
            <h4>Replies ({displayThread.replies.length})</h4>
            {displayThread.replies.map((reply) => (
              <CommentCard 
                comment={reply} 
                key={reply._id} 
                onLike={handleLike}
                onFollowToggle={handleFollowToggle}
                showReplyButton={true}
                parentComment={displayThread.comment} // Shows "replying to @username"
                showOptions={true}
              />
            ))}
          </div>
        )}

        {/* Reply form to reply to the main comment */}
        <div className="reply-to-main">
          <h4>Reply to {displayThread?.comment?.author?.username}</h4>
          <Ghostcommentform
            parentComment={id}
            isAnonymous={false}
            onReplySuccess={refetch} // Refresh thread after reply
          />
        </div>
      </div>
    </div>
  );
};

export default Commentid;