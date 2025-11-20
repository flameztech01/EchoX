import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaRegComment, FaEllipsisH } from "react-icons/fa";
import { useSelector } from "react-redux";

const CommentCard = ({
  comment,
  onLike,
  onFollowToggle,
  showReplyButton = true,
  parentComment = null,
  onDelete = null,
  onEdit = null,
  showOptions = false,
}) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState("");

  // Null check
  if (!comment || !comment.author) {
    return <div className="comment-card">Loading comment...</div>;
  }

  const isLiked = () => comment.likedBy?.includes(userInfo?._id);
  const isOwnComment = () => comment.author?._id === userInfo?._id;
  const isFollowing = () => comment.author?.followers?.includes(userInfo?._id);

  const handleEdit = () => {
    setEditText(comment.text);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (onEdit && editText.trim() && editText !== comment.text) {
      onEdit(comment._id, editText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText("");
  };

  const handleDelete = () => {
    if (onDelete && window.confirm("Delete this comment?")) {
      onDelete(comment._id);
    }
    setShowMenu(false);
  };

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

  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="comment-profile">
          <img
            src={comment.author.profile || "/default-avatar.jpg"}
            alt=""
            className="comment-avatar"
          />
          <div className="comment-user-info">
            <div className="comment-meta">
              <Link
                to={`/profile/${comment.author._id}`}
                className="comment-username"
              >
                {comment.author.username}
              </Link>
              <span className="comment-time">{timeAgo(comment.createdAt)}</span>
            </div>
            {/* Show "replying to" for replies */}
            {parentComment && (
              <div className="replying-to">
                replying to <span>@{parentComment.author?.username}</span>
              </div>
            )}
          </div>
        </div>

        <div className="comment-header-actions">
          {!isOwnComment() &&
            userInfo &&
            (isFollowing() ? (
              <button
                className="follow-btn"
                onClick={() => onFollowToggle(comment.author._id, true)}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="follow-btn"
                onClick={() => onFollowToggle(comment.author._id, false)}
              >
                Follow
              </button>
            ))}

          {/* Options menu for own comments */}
          {isOwnComment() && showOptions && (
            <div className="comment-options">
              <button
                className="icon-btn options-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                <FaEllipsisH className="icon" />
              </button>

              {showMenu && (
                <div className="options-menu">
                  <button onClick={handleEdit}>Edit</button>
                  <button onClick={handleDelete} className="delete-btn">
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comment text or edit form */}
      {isEditing ? (
        <div className="edit-comment">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-textarea"
            maxLength={280}
          />
          <div className="edit-actions">
            <span className="char-count">{editText.length}/280</span>
            <div className="edit-buttons">
              <button onClick={handleCancelEdit} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="save-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="comment-text">{comment.text}</p>
      )}

      <div className="comment-actions">
        <div className="action-item">
          <button className="icon-btn" onClick={() => onLike(comment._id)}>
            {isLiked() ? (
              <FaHeart className="icon liked" />
            ) : (
              <FaRegHeart className="icon" />
            )}
          </button>
          <span>{comment.like || 0}</span>
        </div>

        {showReplyButton && (
          <div className="action-item">
            <Link to={`/comment/${comment._id}`} className="icon-btn">
              <FaRegComment className="icon" />
            </Link>
            <Link to={`/comment/${comment._id}`}>Reply</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;