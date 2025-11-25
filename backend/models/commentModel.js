import express from 'express';
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    text: {type: String, required: true},
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', 
    },
    anonymous: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anonymous',
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    like: {type: Number, default: 0},
    likedBy: [{  // Add this field
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Add this field to store reply count
    replyCount: {type: Number, default: 0},
}, 
{
    timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;