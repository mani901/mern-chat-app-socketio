import Conversation from '../models/conversationModel.js'

export async function createConversation(req, res) {
  const { senderId, receiverId } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId]
    });
  }

  res.status(200).json(conversation);
}

// Get all conversations for a user
export async function getConversations(req, res) {
  const conversations = await Conversation.find({
    participants: req.params.userId
  }).populate("participants", "username isOnline");

  res.status(200).json(conversations);
}
