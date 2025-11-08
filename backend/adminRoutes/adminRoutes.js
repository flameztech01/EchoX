import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    adminLogin,
    registerAdmin,
    getUsers,
    getUser,
    verifyUser,
    disableUser
} from '../adminControllers/adminController.js';

const router = express.Router();

router.post('/login', protect, adminLogin);
router.post('/regis', registerAdmin);
router.get('/users', protect, getUsers);
router.get('/users/:id', protect, getUser);
router.patch('/users/:id/verify', protect, verifyUser);
router.patch('/users/:id/disable', protect, disableUser);