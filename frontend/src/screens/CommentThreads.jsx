import React from "react";
import Postid from "../components/Postid.jsx";
import CommentCard from "../components/CommentCard.jsx";
import Ghostcommentform from "../components/Ghostcommentform.jsx";
import { useGetCommentThreadQuery } from "../slices/commentApiSlice.js";
import { useParams } from "react-router-dom";
import Commentid from "../components/Commentid.jsx";

const CommentThreads = () => {

  const { id } = useParams(); // This is commentId
  const { data: threadData } = useGetCommentThreadQuery(id);

  return (
    <div>
        <Commentid />

      {/* Reply form */}
      <Ghostcommentform parentComment={id} />
    </div>
  );
};

export default CommentThreads;
