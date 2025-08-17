import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    
    // Generate token for the new user
    const token = generateToken(user);
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ message: info.message });
    
    // Generate token
    const token = generateToken(user);
    
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  })(req, res, next);
};

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
});

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.redirect('/login');
    
    // Generate token
    const token = generateToken(user);
    
    // Redirect to frontend with token in query or send it in response
    // For example, redirect to: http://localhost:3000/profile?token=...
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?token=${token}`);
  })(req, res, next);
};

export const logout = (req, res) => {
  // With JWT, logout is typically handled client-side by discarding the token
  res.json({ message: 'Logout successful' });
};

export const profile = (req, res) => {
  // This route will be protected by JWT middleware
  res.json({ user: req.user });
};