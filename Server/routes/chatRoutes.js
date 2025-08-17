import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getUsers, getMessageHistory } from '../controllers/chatController.js';

const chatRoutes = Router();

chatRoutes.get('/users', verifyToken, getUsers);
chatRoutes.get('/messages/:userId', verifyToken, getMessageHistory);

export default chatRoutes;
