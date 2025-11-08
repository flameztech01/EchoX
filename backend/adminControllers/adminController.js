import express from 'express';
import Admin from '../models/adminModel.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';


//Admin Login 
const adminLogin = asyncHandler(async (req, res, next) => {
    const { username, email, password} = req.body;

    const admin = await Admin.findOne({email});

    if(admin && (await admin.matchedPassword(password))){
        const token = generateToken(res, admin._id);
        res.status(201).json({
            id: admin._id,
            username: admin.username,
            email: admin.email,
            token
        })
    }
});

//Admin Signup
const registerAdmin = asyncHandler(async (req, res, next) => {
    const {name, username, email, password} = req.body;

    const adminExists = await Admin.findOne({email});

    if(adminExists){
        res.status(400);
        throw new Error('Admin Exists already. Remember your login or stay out forever')
    }

    const newAdmin = await Admin.create({
        name, username, email, password
    });

    if(newAdmin){
        const token = generateToken(res, admin._id);

        res.status(200).json({
            id: admin._id,
            name: admin.name,
            username: admin.username,
            email: admin.email,
            token
        })
    } else {
        res.status(400);
        throw new Error('Admin Registration Successful');
    }
})

//Get all users
const getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().sort({createdAt: -1});

    res.status(200).json(users)
});

//Get single user
const getUser = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

    const user = await User.findById(id);

    if(!user){
        res.status(404);
        throw new Error('User not found');
    }
});

//Verify user account 
const verifyUser = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

    const user = await User.findById(id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({message: 'User verified successfully'});
});

//Disable user account 
const disableUser = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

    const user = await User.findById(id);

    if(!user) {
        res.status(404);
        throw new Error('User Account not found');
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({message: 'User Disabled Successfully'})

});

export {
    adminLogin,
    registerAdmin,
    getUsers,
    getUser,
    verifyUser,
    disableUser
};
