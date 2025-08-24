import api from './axios';

export const messageAPI = {
    // Get chat list (conversations)
    getChatList: async () => {
        try {
            console.log('Fetching chat list...');
            const response = await api.get('/messages');
            console.log('Chat list response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching chat list:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch chat list');
        }
    },

    // Get messages for a specific user/chat
    getMessages: async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            console.log('Fetching messages for user:', userId);
            const response = await api.get(`/messages/${userId}`);
            console.log('Messages response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch messages');
        }
    },

    // Mark messages as read (if needed for HTTP endpoint)
    markAsRead: async (senderId) => {
        try {
            if (!senderId) {
                throw new Error('Sender ID is required');
            }

            console.log('Marking messages as read from:', senderId);
            const response = await api.patch(`/messages/read/${senderId}`);
            return response.data;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
        }
    },
};

export const userAPI = {
    // Get all users (for chat initiation)
    getUsers: async () => {
        try {
            console.log('Fetching users...');
            const response = await api.get('/auth/users');
            console.log('Users response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch users');
        }
    },

    // Get user profile
    getProfile: async () => {
        try {
            console.log('Fetching user profile...');
            const response = await api.get('/auth/profile');
            console.log('Profile response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch profile');
        }
    },

    // Search users (if needed)
    searchUsers: async (query) => {
        try {
            if (!query || query.trim().length < 2) {
                return [];
            }

            console.log('Searching users with query:', query);
            const response = await api.get(`/auth/users/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error('Error searching users:', error);
            // Don't throw error for search, return empty array
            return [];
        }
    },
};

// Helper function to format chat data
export const formatChatData = (chatItem) => {
    if (!chatItem) return null;

    return {
        id: chatItem.partnerId || chatItem._id,
        partnerId: chatItem.partnerId || chatItem._id,
        name: chatItem.partnerUsername || 'Unknown User',
        username: chatItem.partnerUsername || 'Unknown User',
        email: chatItem.partnerEmail,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            chatItem.partnerUsername || 'Unknown'
        )}&background=random`,
        lastMessage: chatItem.lastMessage || '',
        lastMessageTimestamp: chatItem.lastMessageTimestamp,
        time: formatMessageTime(chatItem.lastMessageTimestamp),
        unread: (chatItem.unreadCount || 0) > 0,
        unreadCount: chatItem.unreadCount || 0,
        isOnline: chatItem.isOnline || false,
        lastMessageSender: chatItem.lastMessageSender,
    };
};

// Helper function to format message data
export const formatMessageData = (message, currentUserId) => {
    if (!message) return null;

    const isOwn = message.sender?._id === currentUserId || message.sender === currentUserId;

    return {
        _id: message._id,
        id: message._id,
        sender: {
            _id: message.sender?._id || message.sender,
            username: message.sender?.username || 'Unknown',
            email: message.sender?.email,
        },
        receiver: {
            _id: message.receiver?._id || message.receiver,
            username: message.receiver?.username || 'Unknown',
            email: message.receiver?.email,
        },
        content: message.content || '',
        timestamp: message.timestamp || message.createdAt,
        time: formatMessageTime(message.timestamp || message.createdAt),
        read: message.read || false,
        isOwn,
        sending: message.sending || false,
        tempId: message.tempId,
    };
};

// Helper function to format time
export const formatMessageTime = (timestamp) => {
    if (!timestamp) return 'Just now';

    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Unknown time';
    }
};

// Helper function to format user data
export const formatUserData = (user) => {
    if (!user) return null;

    return {
        _id: user._id,
        id: user._id,
        username: user.username || 'Unknown',
        email: user.email || '',
        displayName: user.displayName || user.username || 'Unknown',
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.username || 'Unknown'
        )}&background=random`,
        isOnline: user.isOnline || false,
        lastSeen: user.lastSeen,
    };
};

// Export all APIs as default
export default {
    message: messageAPI,
    user: userAPI,
    formatChatData,
    formatMessageData,
    formatMessageTime,
    formatUserData,
};