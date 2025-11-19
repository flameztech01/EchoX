import express from 'express';
import Post from '../models/postModel.js';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'

//Create post 
const createPost = asyncHandler(async (req, res, next) => {
    const {text, hashtag} = req.body;
    
    // Check file size before processing (5MB limit)
    if (req.file && req.file.size > 5 * 1024 * 1024) {
        res.status(413);
        throw new Error('File too large. Maximum size is 5MB.');
    }

    const image = req.file ? req.file.path : null;

    const newPost = await Post.create({
        user: req.user._id,
        text,
        image,
        hashtag: hashtag || [],
    });

    if(!newPost) {
        res.status(400)
        throw new Error('Post no gree create oo, try again')
    }

    res.status(201).json({
        message: 'Your post dey live now', newPost
    });
});

const getPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get user
    const user = await User.findById(userId).select("following");

    // ---------------------------
    // 1. FOLLOWING POSTS + USER POSTS (Top priority)
    // ---------------------------
    const followingPosts = await Post.find({
        user: { $in: [...user.following, userId] }
    })
        .sort({ createdAt: -1 })
        .populate("user", "name username profile followers");


    // ---------------------------
    // 2. POSTS USER LIKED (interests)
    // ---------------------------
    const likedPosts = await Post.find({ likedBy: userId });

    // Extract hashtags user engages with
    const hashtagsUserLiked = likedPosts.flatMap(p => p.hashtag);

    // ---------------------------
    // 3. RELATED INTEREST POSTS (hashtags / similar users)
    // ---------------------------
    const relatedPosts = await Post.find({
        _id: { $nin: followingPosts.map(p => p._id) },
        hashtag: { $in: hashtagsUserLiked }
    })
        .sort({ createdAt: -1 })
        .populate("user", "name username profile followers");

    // ---------------------------
    // 4. TRENDING POSTS (fallback recommendations)
    // ---------------------------
    const trendingPosts = await Post.find({
        _id: { 
            $nin: [
                ...followingPosts.map(p => p._id),
                ...relatedPosts.map(p => p._id)
            ]
        }
    })
        .sort({ like: -1, createdAt: -1 }) // viral first
        .limit(20)
        .populate("user", "name username profile followers");

    // ---------------------------
    // Combine in ranking order
    // ---------------------------
    let allPosts = [
        ...followingPosts,   // #1 priority
        ...relatedPosts,     // #2 priority
        ...trendingPosts     // #3 priority
    ];

    // Remove duplicates
    const uniquePosts = Array.from(
        new Map(allPosts.map(post => [post._id.toString(), post])).values()
    );

    // Final sort by time
    uniquePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(uniquePosts);
});



//Get single post
const getPost = asyncHandler(async (req, res, next) => {
          const id = req.params.id;
            const post = await Post.findById(id).populate('user', 'name username profile followers');

            if(!post) {
                res.status(404);
                throw new Error('Omo be like who post am don delete am');
            }

            res.status(200).json(post);
});

//Search Post by what's in text
const searchPost = asyncHandler(async (req, res, next) => {
    const {text} = req.params;
    const search = await Post.find({text: {$regex: new RegExp(text, 'i')}});

    if(!search){
        res.status(404);
        throw new Error('Omo wetin you dey find no dey');
    }

    res.status(200).json(search);
})

//Posts posted by user
const userPosts = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const userPost = await Post.find({user: userId}).sort({createdAt: -1})

    res.status(200).json(userPost);
});

//Edit Post 
const editPost = asyncHandler(async (req, res, next) => {
    const {text} = req.body;
    const {id} = req.params;

    const updatedPost = await Post.findByIdAndUpdate(
        id,
        {text},
        {new: true, runValidators: true}
    );

    if(!updatedPost){
        res.status(400);
        throw new Error('Your post no gree update oo. Be like na to delete am')
    }
});

//Delete Post 
const deletePost = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

    const deletedPost = Post.findByIdAndDelete(id);

    if(!deletePost) {
        res.status(404);
        throw new Error('You dey okay? wetin you wan delete no dey. no disturb me')
    }

    res.status(200).json({Message: 'Your post don delete. na you know the rubbish you post', deletedPost});
});

//Like post
const likePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

        // Check if user already liked
    const alreadyLiked = post.likedBy.includes(req.user._id);

 if (alreadyLiked) {
        // Unlike
        post.like -= 1;
        post.likedBy.pull(req.user._id);
    } else {
        // Like
        post.like += 1;
        post.likedBy.push(req.user._id);
    }

    await post.save();
    res.status(200).json(post);
});


export {
    createPost,
    getPosts,
    getPost,
    searchPost,
    userPosts,
    editPost,
    deletePost,
    likePost
};