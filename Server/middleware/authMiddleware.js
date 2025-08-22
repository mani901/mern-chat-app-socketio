import { verifyJWT } from '../utils/verifyJwt.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const user = await verifyJWT(token);
    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Invalid token' || error.message === 'No token provided') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};