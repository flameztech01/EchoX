import express from 'express';
import {
  googleAuth,
    loginUser,
    registerUser,
    getUserProfile,
    getAnyUserProfile,
    updateProfile,
    logoutUser
} from '../controllers/userController.js';
import {protect} from '../middleware/authMiddleware.js';
import multer from 'multer';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import {v2 as cloudinary} from 'cloudinary';

const router = express.Router();

//Cloudinary Configuration with lowercase unserscores
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "EchoX_users",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({storage});

cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary connected successfully'))
  .catch(err => console.error('Cloudinary not connected', err.message));

router.post('/google', googleAuth);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', protect, getUserProfile);
router.get('/profile/:id', protect, getAnyUserProfile);
router.put('/update-profile', protect, upload.single('image'), updateProfile);
router.post('/logout', logoutUser);

export default router;