import express from "express";
import Comment from "../models/commentModel.js";
import asyncHandler from "express-async-handler";

//Other Models
import Post from "../models/postModel.js";
import Anonymous from "../models/anonymousModel.js";

// Create comment
// Create comment
const createComment = asyncHandler(async (req, res) => {
  const { text, post, anonymous, parentComment } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Text is required");
  }

  const comment = await Comment.create({
    text,
    author: req.user._id,
    post: post || null,
    anonymous: anonymous || null,
    parentComment: parentComment || null,
  });

  // If this is a reply, increment the parent comment's replyCount
  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, {
      $inc: { replyCount: 1 }
    });
    
    // Get parent comment to notify its author
    const parentCommentDoc = await Comment.findById(parentComment)
      .populate('author', '_id notificationSettings');
    
    // Notify parent comment author about reply (if not replying to self)
    if (parentCommentDoc && parentCommentDoc.author._id.toString() !== req.user._id.toString()) {
      await createNotification(parentCommentDoc.author._id, {
        type: 'reply',
        senderId: req.user._id,
        postId: post,
        commentId: comment._id,
        message: `${req.user.username} replied to your comment`
      });
    }
  }

  // Push comment to the correct model
  if (post) {
    await Post.findByIdAndUpdate(post, {
      $push: { comments: comment._id },
    });
    
    // Get post to notify its owner about comment
    const postDoc = await Post.findById(post)
      .populate('user', '_id notificationSettings');
    
    // Notify post owner about new comment (if not commenting on own post)
    if (postDoc && postDoc.user._id.toString() !== req.user._id.toString()) {
      await createNotification(postDoc.user._id, {
        type: 'comment',
        senderId: req.user._id,
        postId: post,
        commentId: comment._id,
        message: `${req.user.username} commented on your post`
      });
    }
  }
  
  if (anonymous) {
    await Anonymous.findByIdAndUpdate(anonymous, {
      $push: { comments: comment._id },
    });
  }

  res.status(201).json(comment);
});


// Get ghost comments
// Get ghost comments
const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    res.status(400);
    throw new Error("Post ID is required");
  }

  const comments = await Comment.find({
    $or: [{ post: postId }, { anonymous: postId }],
    parentComment: null // Only get top-level comments
  })
    .populate("author", "name username profile followers")
    .sort({ createdAt: -1 });

  // Get reply counts for each comment
  const commentsWithReplyCounts = await Promise.all(
    comments.map(async (comment) => {
      const replyCount = await Comment.countDocuments({ 
        parentComment: comment._id 
      });
      
      // Update the comment's replyCount in database (optional)
      await Comment.findByIdAndUpdate(comment._id, { replyCount });
      
      return {
        ...comment.toObject(),
        replyCount
      };
    })
  );

  res.status(200).json(commentsWithReplyCounts);
});

const getCommentThread = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const comment = await Comment.findById(id)
        .populate('author', 'name username profile followers')
        .populate({
            path: 'post',
            select: 'text image user createdAt likedBy like views',
            populate: {
                path: 'user',
                select: 'username profile'
            }
        })
        .populate({
            path: 'anonymous',
            select: 'text image createdAt likedBy like views',
            // Anonymous posts don't have a user field since they're anonymous
        });
    
    const replies = await Comment.find({ parentComment: id })
        .populate('author', 'name username profile followers')
        .populate({
            path: 'post',
            select: 'text image user createdAt likedBy like views',
            populate: {
                path: 'user',
                select: 'username profile'
            }
        })
        .populate({
            path: 'anonymous',
            select: 'text image createdAt likedBy like views',
            // Anonymous posts don't have a user field
        })
        .sort({ createdAt: 1 });

    res.status(200).json({
        comment,
        replies
    });
});

//Delete comment
//Delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedComment = await Comment.findById(id);

  if (!deletedComment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // If this is a reply, decrement the parent comment's replyCount
  if (deletedComment.parentComment) {
    await Comment.findByIdAndUpdate(deletedComment.parentComment, {
      $inc: { replyCount: -1 }
    });
  }

  // Also delete any replies to this comment
  await Comment.deleteMany({ parentComment: id });
  
  // Now delete the main comment
  await Comment.findByIdAndDelete(id);

  res.status(200).json(deletedComment);
});

//Like Comment
const likeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id)
    .populate('author', '_id notificationSettings');

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // Check if user already liked
  const alreadyLiked = comment.likedBy.includes(req.user._id);

  if (alreadyLiked) {
    // Unlike
    comment.like -= 1;
    comment.likedBy.pull(req.user._id);
  } else {
    // Like
    comment.like += 1;
    comment.likedBy.push(req.user._id);
    
    // Create notification for comment owner (if not liking own comment)
    if (comment.author && comment.author._id.toString() !== req.user._id.toString()) {
      await createNotification(comment.author._id, {
        type: 'comment_like',
        senderId: req.user._id,
        commentId: comment._id,
        postId: comment.post,
        message: `${req.user.username} liked your comment`
      });
    }
  }

  await comment.save();
  res.status(200).json(comment);
});

export { createComment, 
  getComments, 
  getCommentThread, 
  deleteComment, 
  likeComment
 };
