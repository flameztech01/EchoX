import jwt, { decode } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';
const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //Check if a user
            if(decoded.userId){
                req.user = await User.findById(decoded.userId).select('-password');

                        if(!req.user){
                            res.status(401);
                            throw new Error('Not Authorized, user not found')
                        }
            }

            //Check if an Admin
            if(decoded.adminId){
                req.admin = await Admin.findById(decoded.adminId).select('-password');

                if(!req.admin){
                    res.status(401);
                    throw new Error('Not Authorized, Admin not Found')
                }
            }

            //neither Admin nor user
            if(!req.user && !req.admin){
                res.status(401);
                throw new Error('Not Authorized, invalid Token')
            }   

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, Invalid token');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export {protect};