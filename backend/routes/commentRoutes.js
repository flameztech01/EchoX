import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createComment,
    getComments,
    deleteComment,
    likeComment
} from '../controllers/commentController.js';

const router = express.Router();

router.post('/reply', protect, createComment);
// router.get('/anonymous/:postId', protect, getGhostComments);
router.get('/post/:postId', protect, getComments);
router.delete('/:id', protect, deleteComment);
router.patch('/:id/like', protect, likeComment);

export default router;