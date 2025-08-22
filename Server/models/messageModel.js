import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

messageSchema.index({ sender: 1, receiver: 1, timestamp: -1 }); // Optimize for sorting by timestamp
messageSchema.index({ receiver: 1, read: 1 }); // Optimize for unread counts

export default mongoose.model('Message', messageSchema);