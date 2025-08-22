import express from 'express';
import { getMessages , getChatList} from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/:userId', verifyToken, getMessages);
router.get('/', verifyToken, getChatList);
export default router;