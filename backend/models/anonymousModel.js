import express from 'express';
import mongoose from 'mongoose';

const anonymousSchema = mongoose.Schema({
    text: {type: String, maxLength: 200},
    like: {type: Number, default: 0},
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {type: Date, default: Date.now}
}, {
    timestamps: true
});

const Anonymous = mongoose.model('Anonymous', anonymousSchema);
export default Anonymous;