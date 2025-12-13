import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { errorHandler, notFound} from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import anonymousRoutes from './routes/anonymousRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/echox';
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://echox.site', 'capacitor://echox.site', 'capacitor://localhost', 'http://localhost']
    : ['http://localhost:3000', 'https://echox-wzh0.onrender.com'];

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
app.use('/api/users', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/anonymous', anonymousRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

//Error Middleware
app.use(errorHandler);
app.use(notFound);

// MongoDB connection
mongoose
.connect(MONGO_URL)
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
