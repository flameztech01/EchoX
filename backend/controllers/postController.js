import express from 'express';
import Post from '../models/postModel.js';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

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

//Get all posts with advanced personalized feed
const getPosts = asyncHandler(async (req, res, next) => {
  try {
    const currentUserId = req.user?._id;
    
    let userFollowing = [];
    let userLikedPosts = [];
    
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId)
        .select('following')
        .populate('following', '_id');
      
      userFollowing = currentUser?.following?.map(user => user._id.toString()) || [];
      
      // Get posts user has liked
      const likedPostsData = await Post.find({ 
        likedBy: currentUserId 
      }).select('_id');
      userLikedPosts = likedPostsData.map(post => post._id.toString());
    }

    // Get all posts with necessary data
    const allPosts = await Post.find()
      .populate('user', 'name username profile followers')
      .populate('comments')
      .populate('likedBy', '_id')
      .sort({ createdAt: -1 });

    if (!allPosts || allPosts.length === 0) {
      res.status(404);
      throw new Error('Omo! Post no dey oo. Try post nau');
    }

    // Calculate post scores for personalized ranking
    const scoredPosts = allPosts.map(post => {
      const score = calculatePostScore(post, userFollowing, userLikedPosts, currentUserId);
      return { post, score };
    });

    // Sort by score (descending) and then by date for new posts
    scoredPosts.sort((a, b) => {
      // New posts (last 24 hours) get priority
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const aIsNew = new Date(a.post.createdAt) > twentyFourHoursAgo;
      const bIsNew = new Date(b.post.createdAt) > twentyFourHoursAgo;
      
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      
      // Then sort by calculated score
      return b.score - a.score;
    });

    // Add some randomness to avoid identical feeds
    const finalPosts = addRandomness(scoredPosts.map(item => item.post));

    res.status(200).json(finalPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
});

// Calculate personalized score for each post
const calculatePostScore = (post, userFollowing, userLikedPosts, currentUserId) => {
  let score = 0;
  
  const postCreatedAt = new Date(post.createdAt);
  const now = new Date();
  const hoursSinceCreation = (now - postCreatedAt) / (1000 * 60 * 60);
  
  // Base score from likes
  score += (post.likedBy?.length || 0) * 2;
  
  // Score from comments
  score += (post.comments?.length || 0) * 3;
  
  // Recent posts get higher score (decays over time)
  const recencyScore = Math.max(0, 10 - (hoursSinceCreation / 6));
  score += recencyScore;
  
  // Posts from followed users get significant boost
  if (userFollowing.includes(post.user?._id?.toString())) {
    score += 15;
  }
  
  // Posts similar to ones user liked get boost
  if (userLikedPosts.includes(post._id.toString())) {
    score += 20;
  }
  
  // Add some random variation (0-5 points)
  score += Math.random() * 5;
  
  return score;
};

// Add randomness to avoid identical feeds
const addRandomness = (posts) => {
  const shuffled = [...posts];
  
  // For posts beyond the first 5, shuffle them with some probability
  for (let i = 5; i < shuffled.length; i++) {
    if (Math.random() < 0.3) { // 30% chance to swap with random post
      const j = Math.floor(Math.random() * (shuffled.length - 5)) + 5;
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  
  return shuffled;
};

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