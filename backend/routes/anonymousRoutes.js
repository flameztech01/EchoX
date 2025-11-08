import express from 'express';  
import { protect } from '../middleware/authMiddleware.js';
import {
    postAnonymous,
    getAnonymous,
    getOneAnonymous,
    deleteAnonymous,
    likeAnonymous
} from '../controllers/anonymousController.js';


const router = express.Router();

router.post('/post', protect, postAnonymous);
router.get('/', protect, getAnonymous);
router.get('/:id', protect, getOneAnonymous);
router.delete('/delete/:id', protect, deleteAnonymous);
router.patch('/:id/like', protect, likeAnonymous);


export default router;