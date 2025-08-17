import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import AppError from '../middleware/errorMiddelware.js';
import { StatusCodes } from 'http-status-codes';


// @desc    Get all users
// @route   GET /api/chat/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
    
    if (!users || users.length === 0) {
      return next(new AppError('No users found', StatusCodes.NOT_FOUND));
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Users fetched successfully",
      data: users
    });
  } catch (error) {
    return next(new AppError(error.message || 'Error fetching users', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// @desc    Get messages between two users
// @route   GET /api/chat/messages/:userId
// @access  Private
export const getMessageHistory = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort('createdAt');
    
    res.status(StatusCodes.OK).json(messages);
  } catch (error) {
    next(new AppError('Failed to fetch message history', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};