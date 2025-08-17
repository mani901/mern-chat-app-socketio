import { Router } from 'express';
import { register, login, googleAuth, googleCallback, profile, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const authRoutes = Router();

// Local auth routes
authRoutes.post('/register', register);
authRoutes.post('/login', login);

// Google auth routes
authRoutes.get('/google', googleAuth);
authRoutes.get('/google/callback', googleCallback);

// Protected route
authRoutes.get('/profile', verifyToken, profile);

// Logout
authRoutes.post('/logout', logout);

export default authRoutes;
