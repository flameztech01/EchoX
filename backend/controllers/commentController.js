import express from 'express';
import Comment from '../models/commentModel.js';
import asyncHandler from 'express-async-handler';

// Create comment
const createComment = asyncHandler(async (req, res) => {
    const { text, author, post, anonymous, parentComment } = req.body;
    
    if (!text) {
        res.status(400);
        throw new Error('Text and author are required');
    }
    
    const comment = await Comment.create({
        text, 
        author: req.user._id,
        post: post || null,
        anonymous: anonymous || null,
    });

    res.status(201).json(comment);
});

// Get ghost comments
const getComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    
    if (!postId) {
        res.status(400);
        throw new Error('Post ID is required');
    }
    
    const comments = await Comment.find({ 
        $or: [
            { post: postId },
            { anonymous: postId }
        ]
    })
    .populate('author', 'name username profile followers')
    .sort({ createdAt: -1 });
    
    res.status(200).json(comments);
});

//Delete comment 
const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);
    
    if(!deletedComment) {
        res.status(404);
        throw new Error('Comment not found');
    }
    
    res.status(200).json(deletedComment);
});

//Like Comment
const likeComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);

  if(!comment){
        res.status(404);
        throw new Error('Anonymous wey you wan like no dey again')
    };

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

export {
    createComment,
    getComments,
    deleteComment,
    likeComment
};