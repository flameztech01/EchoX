import express from 'express';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import { processFacebookAuth } from '../services/facebookAuth.js';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Add this helper function
const getUserInfoFromAccessToken = async (accessToken) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google');
  }
  const userInfo = await response.json();
  return userInfo;
};

// Update your googleAuth function
const googleAuth = asyncHandler(async (req, res, next) => {
    const { token: googleToken } = req.body;

    if (!googleToken) {
        res.status(400);
        throw new Error('Google token is required');
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
            console.log('Google auth error:', accessError);
            res.status(400);
            throw new Error('Invalid Google token');
        }
    }

    // Check if user already exists with this Google ID
    let user = await User.findOne({ 
        $or: [
            { googleId },
            { email }
        ]
    });

    console.log('Found user:', user);

    if (user) {
        // If user exists but doesn't have googleId, update it
        if (!user.googleId) {
            user.googleId = googleId;
            user.isVerified = true;
            await user.save();
        }
    } else {
        // CREATE NEW USER - THIS WAS MISSING!
        const baseUsername = email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '');
        let username = baseUsername;
        let counter = 1;

        // Ensure username is unique
        while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        user = await User.create({
            googleId,
            name: name || '',
            username,
            email,
            profile: picture || '',
            password: `google-auth-${googleId}`,
            isVerified: true,
            authMethod: 'google'
        });
        console.log('Created new user:', user);
    }

    // Check if user was properly created/retrieved
    if (!user || !user._id) {
        throw new Error('User creation failed');
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
     console.log('Login request received:', req.body);
    const { username, email, password} = req.body;

    const user = await User.findOne({email});
    console.log('User found:', user);

    if(user && (await user.matchPassword(password))){
        const token = generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio,
            profile: user.profile,
            token,
        });
    } else {
        res.status(400)
        throw new Error('Your Email or Password no correct')
    }
})


///Register a new User
const registerUser = asyncHandler(async (req, res, next) => {
    console.log('Register request received:', req.body);
    
    const {name, username, email, password} = req.body;

    const userExists = await User.findOne({email});
    console.log('User exists check:', userExists);

    if(userExists) {
        res.status(400)
        throw new Error('You no get Sense? You get account already')
    }

    const user = await User.create({
        name, username, email, password
    });

    if(user){
        const token = generateToken(res, user._id);
        res.status(201).json({
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            token, // Remove password from response!
        })
    } else{
        res.status(400)
        throw new Error('Omo! your account no gree create oo, no vex')
    }
});

//Get User Profile
const getUserProfile = asyncHandler(async (req, res, next) => {
    const user = {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
    };

    res.status(200).json(user);
});

//Get any User Profile 
const getAnyUserProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');

    if(user){
        res.status(200).json({
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profile: user.profile,
            bio: user.bio,
            posts: user.posts 
        });
    } else {
        res.status(400)
        throw new Error('User no dey agian');
    }
})


///Update Profile
const updateProfile = asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }

    const user = await User.findById(req.user._id);
    
    if(user){
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;

        // ONLY update profile if there's a file upload
        if(req.file){
            console.log('Cloudinary file:', req.file);
            user.profile = req.file.path; // This should be the permanent Cloudinary URL
        }
        // Remove this line: user.profile = req.body.profile || user.profile;

        if(req.body.password){
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        console.log('Saved profile URL:', updatedUser.profile); // Debug

        res.status(200).json({
            id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            profile: updatedUser.profile,
            bio: updatedUser.bio
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
});

//Logout User
const logoutUser = asyncHandler(async (req, res, next) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json('You don log out. Do quick come back sha')
});

export {
    googleAuth,
    loginUser,
    registerUser,
    getUserProfile,
    getAnyUserProfile,
    updateProfile,
    logoutUser
};