// controllers/messageController.js
import mongoose from 'mongoose';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';

export const getChatList = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id); // Ensure ObjectId type
    const chatList = await Message.aggregate([
      // Match messages involving the user (as sender or receiver)
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      },
      // Sort by timestamp descending to get latest message first
      { $sort: { timestamp: -1 } },
      // Group by conversation partner
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$content' },
          lastMessageTimestamp: { $first: '$timestamp' },
          lastMessageSender: { $first: '$sender' },
        },
      },
      // Lookup user details for partner
      {
        $lookup: {
          from: 'users', // Correct collection name (mongoose pluralizes and lowercases)
          localField: '_id',
          foreignField: '_id',
          as: 'partner',
        },
      },
      // Handle case where partner is not found
      {
        $unwind: {
          path: '$partner',
          preserveNullAndEmptyArrays: true, // Keep chats even if partner deleted
        },
      },
      // Add unread count
      {
        $lookup: {
          from: 'messages',
          let: { partnerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$sender', '$$partnerId'] },
                    { $eq: ['$read', false] },
                  ],
                },
              },
            },
            { $count: 'unreadCount' },
          ],
          as: 'unread',
        },
      },
      // Project final fields
      {
        $project: {
          partnerId: '$_id',
          partnerUsername: {
            $ifNull: ['$partner.username', 'Unknown User'], // Fallback for deleted users
          },
          partnerEmail: {
            $ifNull: ['$partner.email', 'unknown@example.com'],
          },
          isOnline: {
            $ifNull: ['$partner.isOnline', false],
          },
          lastMessage: 1,
          lastMessageTimestamp: 1,
          lastMessageSender: 1,
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ['$unread.unreadCount', 0] }, 0],
          },
        },
      },
      // Sort by last message timestamp
      { $sort: { lastMessageTimestamp: -1 } },
      // Optional: Limit for pagination
      { $limit: 50 }, // Adjust based on needs
    ]);

    res.status(200).json(chatList);
  } catch (error) {
    console.error('Error fetching chat list:', error.message); // Log for debugging
    res.status(500).json({ message: 'Failed to fetch chat list', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    // Validate userId as ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ timestamp: 1 })
      .populate('sender receiver', 'username email');

    // Mark messages as read when fetched
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        read: false
      },
      { read: true }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};