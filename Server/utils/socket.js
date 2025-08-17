import Message from '../models/messageModel.js';

const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle user joining their personal room
    socket.on('joinUser', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Handle real-time messaging
    socket.on('sendMessage', async (messageData) => {
      try {
        // Validate required fields
        if (!messageData.sender || !messageData.receiver || !messageData.content) {
          return socket.emit('messageError', 'Missing required fields');
        }

        // Save message to database
        const message = await Message.create(messageData);
        const populatedMessage = await Message.populate(message, {
          path: 'sender receiver',
          select: 'username avatar isOnline'
        });

        // Emit to both parties
        io.to(messageData.receiver).emit('receiveMessage', populatedMessage);
        io.to(messageData.sender).emit('messageSent', populatedMessage);

      } catch (error) {
        console.error('Message handling error:', error);
        socket.emit('messageError', 'Failed to send message');
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export default configureSocket;