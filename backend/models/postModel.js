import express from 'express';
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    text: {type: String, required: true, maxLength: 280},
    image: {type: String, required: false},
    hashtag: [{
        type: String, 
        lowercase: true
    }],
    like: {type: Number, default: 0},
    likedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {type: Date, default: Date.now}
},{ timestamps: true});

// Index for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

const Post = mongoose.model('Post', postSchema);
export default Post;