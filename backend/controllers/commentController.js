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
  }

  // Push comment to the correct model
  if (post) {
    await Post.findByIdAndUpdate(post, {
      $push: { comments: comment._id },
    });
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
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Anonymous wey you wan like no dey again");
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
