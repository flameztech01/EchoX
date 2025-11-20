import React from 'react';
import { Link } from 'react-router-dom';

const ReplyTo = ({ parentComment }) => {
  if (!parentComment || !parentComment.author) return null;

  return (
    <div className="replying-to">
      replying to <Link to={`/profile/${parentComment.author._id}`}>
        @{parentComment.author.username}
      </Link>
    </div>
  );
};

export default ReplyTo;