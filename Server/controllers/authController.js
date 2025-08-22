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
  console.log('Google callback route accessed');
  console.log('Query params:', req.query);
  console.log('URL:', req.url);
  
  passport.authenticate('google', { session: false }, (err, user) => {
    console.log('Passport authenticate callback:', { err: err?.message, user: user?.email });
    
    if (err) {
      console.log('Google auth error:', err.message);
      // Redirect to frontend with error
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      console.log('No user returned from Google auth');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent('Google authentication failed')}`);
    }
    
    // Generate token
    const token = generateToken(user);
    console.log('Generated token for user:', user.email);
    
    // Redirect to frontend with success data
    const userData = encodeURIComponent(JSON.stringify({
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName
    }));
    
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/google-callback?token=${token}&user=${userData}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  })(req, res, next);
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({_id:{$ne:req.user._id}});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const logout = (req, res) => {
  // With JWT, logout is typically handled client-side by discarding the token
  res.json({ message: 'Logout successful' });
};

export const profile = (req, res) => {
  // This route will be protected by JWT middleware
  res.json({ user: req.user });
};