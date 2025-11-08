import express from 'express';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';


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
    loginUser,
    registerUser,
    getUserProfile,
    getAnyUserProfile,
    updateProfile,
    logoutUser
};