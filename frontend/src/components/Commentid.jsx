import React from "react";
import { useParams } from "react-router-dom";
import { useGetCommentThreadQuery } from "../slices/commentApiSlice.js";
import CommentCard from "./CommentCard.jsx";
import Ghostcommentform from "./Ghostcommentform.jsx";
import CommentNav from "./CommentNav.jsx";

const Commentid = () => {
  const { id } = useParams(); // comment ID
  const { data: threadData, isLoading, refetch } = useGetCommentThreadQuery(id, {
    pollingInterval: 3000, // Added 3-second polling
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  if (isLoading) return <div>Loading thread...</div>;

  return (
    <div>
      <CommentNav />
      <div className="comment-thread-page">
        {/* Original comment */}
        {threadData?.comment && (
          <CommentCard
            comment={threadData.comment}
            showReplyButton={true}
            showOptions={true}
          />
        )}
        
        {/* Replies with proper nesting */}
        {threadData?.replies?.length > 0 && (
          <div className="replies-section">
            <h4>Replies ({threadData.replies.length})</h4>
            {threadData.replies.map((reply) => (
              <CommentCard 
                comment={reply} 
                key={reply._id} 
                showReplyButton={true}
                parentComment={threadData.comment} // Shows "replying to @username"
                showOptions={true}
              />
            ))}
          </div>
        )}

        {/* Reply form to reply to the main comment */}
        <div className="reply-to-main">
          <h4>Reply to {threadData?.comment?.author?.username}</h4>
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