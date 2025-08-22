
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const verifyJWT = async (token) => {
  try {
    if (!token) throw new Error('No token provided');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('Invalid token');
    return user;
  } catch (error) {
    throw error.name === 'JsonWebTokenError' ? new Error('Invalid token') : error;
  }
};