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

  // Time ago function for post preview
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

  // Render original post preview
  const renderPostPreview = () => {
    if (!displayThread?.comment) return null;
    
    const comment = displayThread.comment;
    
    // Check if it's a regular post or anonymous post
    if (comment.post) {
      // Regular post
      const post = comment.post;
      return (
        <div className="original-post-section">
          <h4 className="section-title">Original Post</h4>
          <div className="post-preview">
            <div className="post-header">
              <img src={post.user?.profile || "/default-avatar.jpg"} alt="" className="post-avatar" />
              <div className="post-user-info">
                <span className="username">{post.user?.username}</span>
                <span className="post-time">{timeAgo(post.createdAt)}</span>
              </div>
            </div>
            <p className="post-text">{post.text}</p>
            {post.image && <img src={post.image} alt="" className="post-image-preview" />}
          </div>
        </div>
      );
    } else if (comment.anonymous) {
      // Anonymous post
      const anonymousPost = comment.anonymous;
      return (
        <div className="original-post-section">
          <h4 className="section-title">Original Anonymous Post</h4>
          <div className="post-preview">
            <div className="post-header">
              <img src="/ghost.jpg" alt="" className="post-avatar" />
              <div className="post-user-info">
                <span className="username">Anonymous</span>
                <span className="post-time">{timeAgo(anonymousPost.createdAt)}</span>
              </div>
            </div>
            <p className="post-text">{anonymousPost.text}</p>
            {anonymousPost.image && <img src={anonymousPost.image} alt="" className="post-image-preview" />}
          </div>
        </div>
      );
    }
    
    return null;
  };

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
        {/* Original Post at the top */}
        {renderPostPreview()}
        
        {/* Original comment that was replied to */}
        {displayThread?.comment && (
          <div className="replied-comment-section">
            <h4 className="section-title">Comment</h4>
            <CommentCard
              comment={displayThread.comment}
              onLike={handleLike}
              onFollowToggle={handleFollowToggle}
              showReplyButton={false} // Entire card is clickable now
              showOptions={true}
              replyCount={displayThread.replies?.length || 0} // Simple: just use the length
            />
          </div>
        )}
        
        {/* Replies with proper nesting - showing parent comment for each reply */}
        {displayThread?.replies?.length > 0 && (
          <div className="replies-section">
            <h4 className="section-title">Replies ({displayThread.replies.length})</h4>
            {displayThread.replies.map((reply) => (
              <div key={reply._id} className="reply-thread">
                {/* Show who this reply is replying to */}
                <div className="replying-to-indicator">
                  <span>Replying to @{displayThread.comment?.author?.username}</span>
                </div>
                <CommentCard 
                  comment={reply} 
                  onLike={handleLike}
                  onFollowToggle={handleFollowToggle}
                  showReplyButton={false} // Entire card is clickable now
                  parentComment={displayThread.comment}
                  showOptions={true}
                  replyCount={0} // Replies don't have nested replies
                />
              </div>
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