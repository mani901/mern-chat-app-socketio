
import { verifyJWT } from '../utils/verifyJwt.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';

export const configureSocket = (io) => {
  const onlineUsers = new Map(); // userId => socket.id
  io.on('connection', (socket) => {
    // Authenticate socket
    socket.on('authenticate', async (token) => {
      try {

        const user = await verifyJWT(token);
        socket.user = user; // Attach full user object
        onlineUsers.set(user._id.toString(), socket.id);

        // Update user's online status in database
        await User.findByIdAndUpdate(user._id, {
          isOnline: true,
          lastSeen: new Date()
        });

        // Notify of unread messages
        const unreadMessages = await Message.find({
          receiver: user._id,
          read: false,
        })
          .distinct('sender') // Get unique senders
          .populate('sender', 'username');

        socket.emit('unreadMessages', unreadMessages.map(sender => ({
          senderId: sender._id,
          username: sender.username,
        })));

        // Broadcast online status
        socket.emit('authenticated', { message: 'Authentication successful' });

        // Send list of currently online users to the newly connected user
        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit('allOnlineUsers', onlineUserIds);

        // Broadcast to all users that this user is now online
        io.emit('onlineStatus', { userId: user._id.toString(), online: true });
      } catch (error) {
        const message = error.message === 'No token provided' || error.message === 'Invalid token'
          ? error.message
          : 'Server error';
        socket.emit('error', { message });
        socket.disconnect(true);
      }
    });

    // Send message
    socket.on('sendMessage', async ({ receiverId, content }) => {
      if (!socket.user) return; // Ensure user is authenticated
      try {
        const message = new Message({
          sender: socket.user._id,
          receiver: receiverId,
          content,
        });
        await message.save();

        // Emit to receiver if online
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit('receiveMessage', {
            _id: message._id,
            sender: {
              _id: socket.user._id,
              username: socket.user.username
            },
            receiver: {
              _id: receiverId
            },
            content,
            timestamp: message.timestamp,
            read: false,
          });
        }

        // Emit back to sender for confirmation
        socket.emit('messageSent', {
          success: true,
          message: {
            _id: message._id,
            sender: {
              _id: socket.user._id,
              username: socket.user.username
            },
            receiver: {
              _id: receiverId
            },
            content,
            timestamp: message.timestamp,
            read: false,
          },
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      if (socket.user) {
        const userId = socket.user._id.toString();
        onlineUsers.delete(userId);

        // Update user's online status in database
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: false,
          lastSeen: new Date()
        });

        io.emit('onlineStatus', { userId: userId, online: false });
        console.log(`User ${socket.user.username} (${userId}) disconnected`);
      }
    });
  });
};