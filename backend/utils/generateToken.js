import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // Must be true
        sameSite: 'none', // Required for cross-site
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
        // Remove domain if it causes issues, let browser handle it
    });

    return token;
};

export default generateToken;
