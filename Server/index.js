import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import passport from './config/passport.js';
import messageRoutes from './routes/messageRoutes.js';
import { configureSocket } from './socket/socket.js';
import errorHandler from './middleware/errorMiddelware.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


configureSocket(io);


// Error handling middleware
app.use(errorHandler);

// Start server
server.listen(PORT, async() => {
  // Connect to database
await connectDB();
  console.log(`Server running on port ${PORT}`);
});