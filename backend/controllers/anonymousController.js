import express from 'express';
import Anonymous from '../models/anonymousModel.js';
import asyncHandler from 'express-async-handler';

const postAnonymous = asyncHandler(async (req, res, next) => {
    const {text, author} = req.body;

    const anonymous = await Anonymous.create({
        text, 
        author: req.user._id,
    });

    if(!anonymous) {
        res.status(404);
        throw new Error('Ur bad character no gree am post')
    }

    res.status(201).json(anonymous);
});

//Get anonymous
const getAnonymous = asyncHandler(async (req, res, next) => {
    const anonymous = await Anonymous.find().sort({ createdAt: -1 });

    if(!anonymous) {
        res.status(404);
        throw new Error('No anonymous posts found');
    }

    res.status(200).json(anonymous);
});

const getOneAnonymous = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const anonymous = await Anonymous.findById(id);

    if(!anonymous) {
        res.status(404);
        throw new Error('No anonymous post found');
    }

    res.status(200).json(anonymous);
});

//Delete anonymous
const deleteAnonymous = asyncHandler(async (req, res, next) => {
    const {id} = req.params.id;

    const deletedAnonymous = await Anonymous.findByIdAndDelete(id);

    if(!deletedAnonymous){
        res.status(404);
        throw new Error('eee don delete. Na you know the rubbish you talk wey you delete sha. ');
    }

    res.status(200).json(deleteAnonymous);
});

//Like anonymous
const likeAnonymous = asyncHandler(async (req, res, next) => {
    const anonymous = await Anonymous.findById(req.params.id);

    if(!anonymous){
        res.status(404);
        throw new Error('Anonymous wey you wan like no dey again')
    };

    // Check if user already liked
    const alreadyLiked = anonymous.likedBy.includes(req.user._id);
    
    if (alreadyLiked) {
        // Unlike
        anonymous.like -= 1;
        anonymous.likedBy.pull(req.user._id);
    } else {
        // Like
        anonymous.like += 1;
        anonymous.likedBy.push(req.user._id);
    }
    
    await anonymous.save();
    res.status(200).json(anonymous);
});

export {
    postAnonymous,
    getAnonymous,
    getOneAnonymous,
    deleteAnonymous,
    likeAnonymous
}