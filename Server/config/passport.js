import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/userModel.js';

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, done) => {
  
    try {
     
      const user = await User.findOne({
        $or: [
          { username: username },
          { email: username }
        ]
      });
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username or email.' });
      }
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    } catch (error) {
      console.log('Passport error:', error);
      return done(error);
    }
  }
));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:8080/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile:', profile.id, profile.emails[0].value);
      
      // First, try to find user by Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('User found by Google ID');
        return done(null, user);
      }
      
      // If not found by Google ID, try to find by email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        console.log('User found by email, linking Google account');
        // Link the Google account to existing user
        user.googleId = profile.id;
        user.displayName = profile.displayName;
        await user.save();
        return done(null, user);
      }
      
      // Create new user if not found
      console.log('Creating new user from Google profile');
      const newUser = new User({
        username: profile.emails[0].value.split('@')[0] + '_' + Date.now(), // Ensure unique username
        email: profile.emails[0].value,
        googleId: profile.id,
        displayName: profile.displayName
      });
      
      await newUser.save();
      console.log('New user created:', newUser.username);
      return done(null, newUser);
    } catch (error) {
      console.error('Google strategy error:', error);
      return done(error);
    }
  }
));

export default passport;