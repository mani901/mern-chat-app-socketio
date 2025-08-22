
import { verifyJWT } from '../utils/verifyJwt.js';
import Message from '../models/messageModel.js';

export const configureSocket = (io) => {    
const onlineUsers = new Map(); // userId => socket.id
io.on('connection', (socket) => {
    // Authenticate socket
    socket.on('authenticate', async (token) => {
      try {
      
        const user = await verifyJWT(token);
        socket.user = user; // Attach full user object
        onlineUsers.set(user._id.toString(), socket.id);
  
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
        io.emit('onlineStatus', { userId: user._id, online: true });
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
            sender: socket.user._id,
            senderUsername: socket.user.username, // Use user data from socket
            content,
            timestamp: message.timestamp,
            read: false,
          });
        }
  
        // Emit back to sender for confirmation
        socket.emit('messageSent', {
          success: true,
          message: {
            sender: socket.user._id,
            receiver: receiverId,
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
    socket.on('disconnect', () => {
      if (socket.user) {
        onlineUsers.delete(socket.user._id.toString());
        io.emit('onlineStatus', { userId: socket.user._id, online: false });
      }
    });
  });
};