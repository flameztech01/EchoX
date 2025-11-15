import express from "express";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import { processFacebookAuth } from "../services/facebookAuth.js";
import DeleteAccount from '../models/deleteUserModel.js';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Add this helper function
const getUserInfoFromAccessToken = async (accessToken) => {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user info from Google");
  }
  const userInfo = await response.json();
  return userInfo;
};

// Update your googleAuth function
const googleAuth = asyncHandler(async (req, res, next) => {
  const { token: googleToken } = req.body;

  if (!googleToken) {
    res.status(400);
    throw new Error("Google token is required");
  }

  let payload;
  let googleId, email, name, picture;

  try {
    // Try to verify as ID token first
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
    ({ sub: googleId, email, name, picture } = payload);
  } catch (error) {
    // If ID token verification fails, try as access token
    try {
      const userInfo = await getUserInfoFromAccessToken(googleToken);
      // For access token, we don't get 'sub' but we can use email as identifier
      googleId = userInfo.sub || `google-${userInfo.email}`;
      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture;
    } catch (accessError) {
      console.log("Google auth error:", accessError);
      res.status(400);
      throw new Error("Invalid Google token");
    }
  }

  // Check if user already exists with this Google ID
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  console.log("Found user:", user);

  if (user) {
    // If user exists but doesn't have googleId, update it
    if (!user.googleId) {
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }
  } else {
    // CREATE NEW USER - THIS WAS MISSING!
    const baseUsername =
      email.split("@")[0] || name.toLowerCase().replace(/\s+/g, "");
    let username = baseUsername;
    let counter = 1;

    // Ensure username is unique
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    user = await User.create({
      googleId,
      name: name || "",
      username,
      email,
      profile: picture || "",
      password: `google-auth-${googleId}`,
      isVerified: true,
      authMethod: "google",
    });
    console.log("Created new user:", user);
  }

  // Check if user was properly created/retrieved
  if (!user || !user._id) {
    throw new Error("User creation failed");
  }

  const token = generateToken(res, user._id);
  res.status(200).json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    profile: user.profile,
    authMethod: user.authMethod,
    token,
    cookieSet: true,
  });
});

// Facebook Auth function..............................................................
//.....................................................................................................
//FACEBOOK AUTH

// const facebookAuth = asyncHandler(async (req, res, next) => {
//     const { token: facebookToken } = req.body;

//     if (!facebookToken) {
//         res.status(400);
//         throw new Error('Facebook token is required');
//     }

//     const { facebookId, email, name, picture } = await processFacebookAuth(facebookToken);

//     // Check if user already exists with this email
//     let user = await User.findOne({ email });

//     console.log('Found user:', user);

//     if (user) {
//         // If user exists, add facebookId to the user object
//         user.facebookId = facebookId;
//         user.isVerified = true;
//         user.authMethod = 'facebook';
//         await user.save();
//     } else {
//         // Create new user
//         const baseUsername = email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '');
//         let username = baseUsername;
//         let counter = 1;

//         // Ensure username is unique
//         while (await User.findOne({ username })) {
//             username = `${baseUsername}${counter}`;
//             counter++;
//         }

//         user = await User.create({
//             facebookId,
//             name: name || '',
//             username,
//             email,
//             profile: picture || '',
//             password: `facebook-auth-${facebookId}`,
//             isVerified: true,
//             authMethod: 'facebook'
//         });
//         console.log('Created new user:', user);
//     }

//     const token = generateToken(res, user._id);
//     res.status(200).json({
//         _id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         bio: user.bio,
//         profile: user.profile,
//         authMethod: user.authMethod || 'facebook',
//         token,
//     });
// });

//Login a new User
const loginUser = asyncHandler(async (req, res, next) => {
  console.log("Login request received:", req.body);
  const { username, email, password } = req.body;

  const user = await User.findOne({ email });
  console.log("User found:", user);

  if (user && (await user.matchPassword(password))) {
    const userWithFollows = await User.findById(user._id)
      .select("-password")
      .populate("following", "_id");
      
    const token = generateToken(res, user._id);
    res.status(200).json({
      _id: userWithFollows._id,
      name: userWithFollows.name,
      username: userWithFollows.username,
      email: userWithFollows.email,
      bio: userWithFollows.bio,
      profile: userWithFollows.profile,
      following: userWithFollows.following,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Your Email or Password no correct");
  }
});

///Register a new User
const registerUser = asyncHandler(async (req, res, next) => {
  console.log("Register request received:", req.body);

  const { name, username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  console.log("User exists check:", userExists);

  if (userExists) {
    res.status(400);
    throw new Error("You no get Sense? You get account already");
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
  });

  if (user) {
    const userWithFollows = await User.findById(user._id)
      .select("-password")
      .populate("following", "_id");
      
    const token = generateToken(res, user._id);
    res.status(201).json({
      id: userWithFollows._id,
      name: userWithFollows.name,
      username: userWithFollows.username,
      email: userWithFollows.email,
      following: userWithFollows.following,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Omo! your account no gree create oo, no vex");
  }
});

//Get User Profile
//Get User Profile - FIX THIS TOO
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('following', '_id');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    profile: user.profile,
    bio: user.bio,
    following: user.following || []
  });
});

//Get any User Profile
const getAnyUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "_id name username") // Populate followers with necessary fields
    .populate("following", "_id name username"); // Populate following
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profile: user.profile,
      bio: user.bio,
      posts: user.posts,
      followers: user.followers || [], // Make sure this is included
      following: user.following || [], // Make sure this is included
    });
  } else {
    res.status(400);
    throw new Error("User no dey agian");
  }
});

///Update Profile
const updateProfile = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;

    // ONLY update profile if there's a file upload
    if (req.file) {
      console.log("Cloudinary file:", req.file);
      user.profile = req.file.path; // This should be the permanent Cloudinary URL
    }
    // Remove this line: user.profile = req.body.profile || user.profile;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    console.log("Saved profile URL:", updatedUser.profile); // Debug

    res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      profile: updatedUser.profile,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//Logout User
const logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json("You don log out. Do quick come back sha");
});

// Delete User
const deleteUser = asyncHandler(async (req, res, next) => {
  const { reason, password } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Verify password before deletion
  if (!(await user.matchPassword(password))) {
    res.status(400);
    throw new Error("Password no correct. You no fit delete account with wrong password.");
  }

  // Save deletion reason to database
  await DeleteAccount.create({
    user: user._id,
    reason: reason,
    email: user.email,
    username: user.username
  });

  // Delete the user
  await User.findByIdAndDelete(req.user._id);
  
  // Clear the cookie
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  
  res.status(200).json({ 
    message: "Your account don delete successfully. We go miss you!" 
  });
});

// FOLLOW USER
const followUser = asyncHandler(async (req, res, next) => {
  const userIdToFollow = req.params.id;
  const currentUserId = req.user._id;

  if (userIdToFollow === currentUserId.toString()) {
    res.status(400);
    throw new Error("Omo! You no fit follow yourself.");
  }

  const userToFollow = await User.findById(userIdToFollow);
  if (!userToFollow) {
    res.status(404);
    throw new Error("Person wey you wan follow no dey here");
  }

  const currentUser = await User.findById(currentUserId);

  if (currentUser.following.includes(userIdToFollow)) {
    res.status(400);
    throw new Error("You don already follow this person before");
  }

  currentUser.following.push(userIdToFollow);
  userToFollow.followers.push(currentUserId);

  await currentUser.save();
  await userToFollow.save();

  // Get the updated user with populated followers
  const updatedUser = await User.findById(userIdToFollow)
    .select("-password")
    .populate("followers", "_id")
    .populate("following", "_id");

  const updatedCurrentUser = await User.findById(currentUserId)
    .select("-password")
    .populate("following", "_id");

  res.status(200).json({
    message: `You don follow ${userToFollow.username}`,
    user: updatedCurrentUser, // Return CURRENT user, not target user
  });
});

//UNFOLLOW USER.........................................

const unfollowUser = asyncHandler(async (req, res, next) => {
  const userIdToUnfollow = req.params.id;
  const currentUserId = req.user._id;

  if (userIdToUnfollow === currentUserId.toString()) {
    res.status(400);
    throw new Error("Omo! You no fit unfollow yourself.");
  }

  const currentUser = await User.findById(currentUserId);
  const userToUnfollow = await User.findById(userIdToUnfollow);

  if (!userToUnfollow) {
    res.status(404);
    throw new Error("Person wey you wan unfollow no dey here");
  }

  if (!currentUser.following.includes(userIdToUnfollow)) {
    res.status(400);
    throw new Error("You never follow this person before.");
  }

  currentUser.following.pull(userIdToUnfollow);
  userToUnfollow.followers.pull(currentUserId);

  await currentUser.save();
  await userToUnfollow.save();

  //UPDATED USER
  const updatedUser = await User.findById(userIdToUnfollow)
    .select("-password")
    .populate("followers", "_id")
    .populate("following", "_id");

  const updatedCurrentUser = await User.findById(currentUserId)
    .select("-password")
    .populate("following", "_id");

  res.status(200).json({
    message: `You don unfollow ${userToUnfollow.username}`,
    user: updatedCurrentUser, // Return CURRENT user, not target user
  });
});

// GET FOLLOWERS
// GET FOLLOWERS - FIX THIS FUNCTION
// GET FOLLOWERS - ADD MUTUAL FOLLOW INFO
const getFollowers = asyncHandler(async (req, res, next) => {
  const userId = req.params.id || req.user._id;

  const user = await User.findById(userId).populate(
    "followers",
    "name username profile bio followers following"
  );

  if (!user) {
    res.status(404);
    throw new Error("User no dey here");
  }

  // Get current user's following list to check mutual follows
  const currentUser = await User.findById(req.user._id).select('following');
  
  // Add mutual follow info to each follower
  const followersWithMutualInfo = user.followers.map(follower => {
    const isMutualFollow = currentUser.following.includes(follower._id);
    return {
      ...follower.toObject(),
      isMutualFollow
    };
  });

  res.status(200).json({
    message: `Followers for ${user.username}`,
    followersCount: user.followers.length,
    followers: followersWithMutualInfo,
  });
});

// Get users that a user is following
const getFollowing = asyncHandler(async (req, res, next) => {
  const userId = req.params.id || req.user._id;

  const user = await User.findById(userId).populate(
    "following",
    "name username profile bio followers"
  );

  if (!user) {
    res.status(404);
    throw new Error("User no dey here");
  }

  // Get current user's following list to check mutual follows
  const currentUser = await User.findById(req.user._id).select('following');
  
  // Add mutual follow info to each followed user
  const followingWithMutualInfo = user.following.map(followedUser => {
    const isMutualFollow = followedUser.followers.includes(req.user._id);
    return {
      ...followedUser.toObject(),
      isMutualFollow
    };
  });

  res.status(200).json({
    message: `People wey ${user.username} dey follow`,
    followingCount: user.following.length,
    following: followingWithMutualInfo,
  });
});

// Get follower count and following count
const getFollowStats = asyncHandler(async (req, res, next) => {
  const userId = req.params.id || req.user._id;

  const user = await User.findById(userId).select(
    "followers following username"
  );

  if (!user) {
    res.status(404);
    throw new Error("User no dey here");
  }

  res.status(200).json({
    username: user.username,
    followersCount: user.followers.length,
    followingCount: user.following.length,
  });
});

export {
  googleAuth,
  loginUser,
  registerUser,
  getUserProfile,
  getAnyUserProfile,
  updateProfile,
  logoutUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStats,
};
