import { Router } from 'express';
import { register, login, googleAuth, googleCallback, profile, logout, getUsers } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const authRoutes = Router();

// Debug middleware to log all requests
authRoutes.use((req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.path}`);
  next();
});

// Local auth routes
authRoutes.post('/register', register);
authRoutes.post('/login', login);

// Google auth routes
authRoutes.get('/google', googleAuth);
authRoutes.get('/google/callback', googleCallback);

// Protected route
authRoutes.get('/profile', verifyToken, profile);
authRoutes.get('/users', getUsers);

// Logout
authRoutes.post('/logout', logout);

export default authRoutes;
