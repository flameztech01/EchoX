import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    text: {type: String, required: true, maxLength: 280},
    image: {type: String, required: false},
    hashtag: [{
        type: String, 
        lowercase: true
    }],
    like: {type: Number, default: 0}, // Changed from 'like' to 'likes'
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [{ // ADD THIS FIELD for comments
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    createdAt: {type: Date, default: Date.now}
}, { timestamps: true });

// Index for better performance - FIXED INDEX FIELDS
postSchema.index({ user: 1, createdAt: -1 }); // Changed from 'author' to 'user'
postSchema.index({ hashtag: 1 }); // Changed from 'hashtags' to 'hashtag'

const Post = mongoose.model('Post', postSchema);
export default Post;