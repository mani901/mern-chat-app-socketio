import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import socketService from '@/services/socket';
import { useAuthStore } from '@/store/useAuthStore';

export const useChatStore = create(
    subscribeWithSelector((set, get) => ({
        // Connection state
        isConnected: false,
        isConnecting: false,
        connectionError: null,

        // Chat data
        chatList: [],
        currentMessages: {},
        selectedChat: null,
        onlineUsers: new Set(),
        unreadCounts: {},
        shouldRefetchChatList: false,

        // UI state
        isSendingMessage: false,
        messageError: null,
        messageTimeouts: new Map(), // Store timeout IDs by temp message ID

        // Actions
        setConnectionState: (state) =>
            set((prev) => ({
                isConnected: state.connected,
                isConnecting: state.connecting,
                connectionError: state.error || null,
            })),

        setChatList: (chats) =>
            set(() => ({
                chatList: Array.isArray(chats) ? chats : [],
            })),

        updateChatListItem: (chatId, updates) =>
            set((state) => {
                const chatExists = state.chatList.some(chat =>
                    chat.partnerId === chatId || chat.id === chatId
                );

                if (!chatExists && updates.lastMessage) {
                    // New conversation detected
                    console.log('New conversation detected with:', chatId);
                    return {
                        ...state,
                        shouldRefetchChatList: true
                    };
                }

                const updatedChatList = state.chatList.map(chat => {
                    if (chat.partnerId === chatId || chat.id === chatId) {
                        return {
                            ...chat,
                            ...updates,
                            time: updates.lastMessageTimestamp ?
                                new Date(updates.lastMessageTimestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : chat.time,
                        };
                    }
                    return chat;
                });

                return { chatList: updatedChatList };
            }),

        resetRefetchFlag: () =>
            set({ shouldRefetchChatList: false }),

        setSelectedChat: (chat) =>
            set(() => ({
                selectedChat: chat,
                messageError: null,
            })),

        setCurrentMessages: (chatId, messages) =>
            set((state) => ({
                currentMessages: {
                    ...state.currentMessages,
                    [chatId]: Array.isArray(messages) ? messages : [],
                },
            })),

        addMessage: (chatId, message) =>
            set((state) => {
                const currentMessages = state.currentMessages[chatId] || [];

                // Check if this is replacing a temp message
                if (!message.tempId && message._id) {
                    // This is a real message, check if we need to replace a temp message
                    const tempMessageIndex = currentMessages.findIndex(m =>
                        m.tempId && m.sending &&
                        m.content === message.content &&
                        (m.sender?._id === message.sender?._id || m.sender === message.sender)
                    );

                    if (tempMessageIndex !== -1) {
                        // Replace temp message with real message
                        console.log('Replacing temp message with real message:', {
                            tempMessageIndex,
                            tempMessage: currentMessages[tempMessageIndex],
                            realMessage: message
                        });
                        const updatedMessages = [...currentMessages];
                        updatedMessages[tempMessageIndex] = {
                            ...message,
                            sending: false, // Ensure sending is false
                            isOwn: message.isOwn !== undefined ? message.isOwn : true, // Preserve ownership
                        };
                        return {
                            currentMessages: {
                                ...state.currentMessages,
                                [chatId]: updatedMessages,
                            },
                        };
                    }
                }

                // Check for exact message duplicates
                const messageExists = currentMessages.some(m =>
                    (m._id && message._id && m._id === message._id) ||
                    (m.tempId && message.tempId && m.tempId === message.tempId)
                );

                if (messageExists) {
                    // Update existing message
                    console.log('Updating existing message:', message);
                    return {
                        currentMessages: {
                            ...state.currentMessages,
                            [chatId]: currentMessages.map(m =>
                                (m._id === message._id || m.tempId === message.tempId)
                                    ? { ...message, sending: false } // Ensure sending is false
                                    : m
                            ),
                        },
                    };
                }

                // Add new message
                console.log('Adding new message to chat:', { chatId, messageId: message._id || message.tempId });
                return {
                    currentMessages: {
                        ...state.currentMessages,
                        [chatId]: [...currentMessages, { ...message, sending: message.sending || false }],
                    },
                };
            }),

        updateMessageStatus: (chatId, messageId, updates) =>
            set((state) => ({
                currentMessages: {
                    ...state.currentMessages,
                    [chatId]: (state.currentMessages[chatId] || []).map(message =>
                        message._id === messageId || message.tempId === messageId
                            ? { ...message, ...updates }
                            : message
                    ),
                },
            })),

        setOnlineUsers: (userIds) =>
            set(() => ({
                onlineUsers: new Set(Array.isArray(userIds) ? userIds : []),
            })),

        updateUserOnlineStatus: (userId, isOnline) =>
            set((state) => {
                const newOnlineUsers = new Set(state.onlineUsers);
                if (isOnline) {
                    newOnlineUsers.add(userId);
                } else {
                    newOnlineUsers.delete(userId);
                }
                return { onlineUsers: newOnlineUsers };
            }),

        setUnreadCount: (chatId, count) =>
            set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [chatId]: Math.max(0, count),
                },
            })),

        incrementUnreadCount: (chatId) =>
            set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [chatId]: (state.unreadCounts[chatId] || 0) + 1,
                },
            })),

        clearUnreadCount: (chatId) =>
            set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [chatId]: 0,
                },
            })),

        sendMessage: async (receiverId, content) => {
            const { selectedChat, addMessage, isConnected } = get();
            const { user } = useAuthStore.getState();

            console.log('=== SendMessage called ===', {
                receiverId,
                content,
                selectedChat,
                isConnected,
                user: user?.username
            });

            if (!receiverId || !content?.trim()) {
                console.error('Invalid message data:', { receiverId, content });
                set({ messageError: 'Invalid message data' });
                return false;
            }

            if (!isConnected) {
                console.error('Not connected to chat server');
                set({ messageError: 'Not connected to chat server' });
                return false;
            }

            // Create temporary message for optimistic UI update
            const tempMessage = {
                tempId: `temp_${Date.now()}_${Math.random()}`,
                sender: {
                    _id: user?._id || user?.id,
                    username: user?.username
                },
                receiver: { _id: receiverId },
                content: content.trim(),
                timestamp: new Date().toISOString(),
                read: false,
                sending: true,
                isOwn: true, // Mark as own message for temp display
            };

            set({ isSendingMessage: true, messageError: null });

            // Add temp message immediately for optimistic UI
            if (selectedChat) {
                addMessage(selectedChat.partnerId || selectedChat._id, tempMessage);
            }

            // Set timeout to remove temp message if no confirmation received
            const timeoutId = setTimeout(() => {
                console.log('Message send timeout, removing temp message');
                const { messageTimeouts } = get();

                // Remove from timeout tracking
                messageTimeouts.delete(tempMessage.tempId);

                if (selectedChat) {
                    set((state) => ({
                        currentMessages: {
                            ...state.currentMessages,
                            [selectedChat.partnerId || selectedChat._id]: (
                                state.currentMessages[selectedChat.partnerId || selectedChat._id] || []
                            ).filter(m => m.tempId !== tempMessage.tempId),
                        },
                        messageError: 'Message send timeout',
                        isSendingMessage: false,
                    }));
                }
            }, 10000); // 10 second timeout

            // Store timeout ID for later clearing
            get().messageTimeouts.set(tempMessage.tempId, timeoutId);

            try {
                console.log('=== Attempting to send message via socket ===');
                console.log('Socket service state:', {
                    isConnected: socketService.isConnected(),
                    connectionState: socketService.getConnectionState()
                });

                const success = socketService.sendMessage(receiverId, content.trim());
                console.log('Socket sendMessage result:', success);

                if (!success) {
                    clearTimeout(timeoutId);
                    throw new Error('Failed to send message through socket');
                }

                console.log('Message sent successfully via socket, waiting for confirmation...');
                // Don't clear timeout here - let the socket event handler clear it
                return true;
            } catch (error) {
                console.error('Error sending message:', error);
                const { messageTimeouts } = get();

                // Clear and remove timeout
                if (messageTimeouts.has(tempMessage.tempId)) {
                    clearTimeout(messageTimeouts.get(tempMessage.tempId));
                    messageTimeouts.delete(tempMessage.tempId);
                }

                // Remove temp message on error
                if (selectedChat) {
                    set((state) => ({
                        currentMessages: {
                            ...state.currentMessages,
                            [selectedChat.partnerId || selectedChat._id]: (
                                state.currentMessages[selectedChat.partnerId || selectedChat._id] || []
                            ).filter(m => m.tempId !== tempMessage.tempId),
                        },
                    }));
                }

                set({
                    messageError: error.message || 'Failed to send message',
                    isSendingMessage: false
                });
                return false;
            }
        },

        // Socket event handlers
        handleMessageReceived: (message) => {
            const { selectedChat, addMessage, incrementUnreadCount, updateChatListItem } = get();
            const { user } = useAuthStore.getState();

            console.log('Handling received message:', message);

            const senderId = message.sender?._id || message.sender;
            const chatId = senderId;

            // Create the received message
            const receivedMessage = {
                ...message,
                _id: message._id || `msg_${Date.now()}`,
                isOwn: false, // Always false for received messages
                sending: false,
                read: false,
            };

            // Add message to the appropriate chat
            addMessage(chatId, receivedMessage);

            // Update chat list with new message info
            updateChatListItem(chatId, {
                lastMessage: message.content,
                lastMessageTimestamp: message.timestamp,
                lastMessageSender: senderId,
            });

            // Increment unread count if not currently viewing this chat
            if (!selectedChat || (selectedChat.partnerId !== senderId && selectedChat.id !== senderId)) {
                incrementUnreadCount(chatId);
            }
        },

        handleMessageSent: (response) => {
            const { selectedChat, messageTimeouts } = get();
            const { user } = useAuthStore.getState();

            console.log('=== Message sent confirmation received ===', response);

            if (response.success && response.message) {
                const message = response.message;
                const receiverId = message.receiver?._id || message.receiver;
                const chatId = receiverId;

                // EFFICIENT APPROACH: Directly update the messages state
                set((state) => {
                    const existingMessages = state.currentMessages[chatId] || [];

                    // Find temp message to replace
                    const tempIndex = existingMessages.findIndex(m =>
                        m.tempId &&
                        m.sending &&
                        m.content === message.content &&
                        (m.sender?._id === message.sender?._id || m.sender === message.sender)
                    );

                    let updatedMessages;
                    if (tempIndex !== -1) {
                        // Clear timeout for the temp message
                        const tempMessage = existingMessages[tempIndex];
                        if (tempMessage.tempId && messageTimeouts.has(tempMessage.tempId)) {
                            clearTimeout(messageTimeouts.get(tempMessage.tempId));
                            messageTimeouts.delete(tempMessage.tempId);
                        }

                        // Replace temp message with confirmed message
                        updatedMessages = [...existingMessages];
                        updatedMessages[tempIndex] = {
                            ...message,
                            isOwn: true,
                            sending: false,
                            read: false,
                        };
                        console.log('✅ Replaced temp message with confirmed message');
                    } else {
                        // Add as new message if temp not found
                        updatedMessages = [...existingMessages, {
                            ...message,
                            isOwn: true,
                            sending: false,
                            read: false,
                        }];
                        console.log('✅ Added confirmed message as new');
                    }

                    return {
                        currentMessages: {
                            ...state.currentMessages,
                            [chatId]: updatedMessages,
                        },
                        isSendingMessage: false,
                    };
                });

                // Update chat list
                get().updateChatListItem(chatId, {
                    lastMessage: message.content,
                    lastMessageTimestamp: message.timestamp,
                    lastMessageSender: user?._id || user?.id,
                });

                console.log('✅ Message confirmation completed successfully');
            } else {
                console.error('❌ Message sent response indicates failure:', response);
                set({ isSendingMessage: false });
            }
        },

        handleOnlineStatusUpdate: (statusData) => {
            const { updateUserOnlineStatus, chatList, setChatList } = get();
            console.log('Handling online status update:', statusData);

            if (statusData.userId) {
                updateUserOnlineStatus(statusData.userId, statusData.online);

                // Also update the chat list to reflect online status changes
                const updatedChatList = chatList.map(chat => {
                    if (chat.partnerId === statusData.userId || chat.id === statusData.userId) {
                        return {
                            ...chat,
                            isOnline: statusData.online
                        };
                    }
                    return chat;
                });

                // Only update if there were changes
                if (JSON.stringify(updatedChatList) !== JSON.stringify(chatList)) {
                    setChatList(updatedChatList);
                }
            }
        },

        handleAllOnlineUsers: (userIds) => {
            const { setOnlineUsers, chatList, setChatList } = get();
            console.log('Handling all online users:', userIds);

            // Initialize online users set with all currently online users
            setOnlineUsers(userIds);

            // Update chat list to reflect current online statuses
            const updatedChatList = chatList.map(chat => {
                const isOnline = Array.isArray(userIds) && userIds.includes(chat.partnerId || chat.id);
                return {
                    ...chat,
                    isOnline
                };
            });

            // Only update if there were changes
            if (JSON.stringify(updatedChatList) !== JSON.stringify(chatList)) {
                setChatList(updatedChatList);
            }
        },

        handleUnreadMessages: (unreadData) => {
            console.log('Handling unread messages:', unreadData);

            // Update unread counts based on server data
            if (Array.isArray(unreadData)) {
                unreadData.forEach(sender => {
                    if (sender.senderId) {
                        get().setUnreadCount(sender.senderId, 1); // Set to 1 as we have unread messages
                    }
                });
            }
        },

        // Initialize socket listeners
        initializeSocketListeners: () => {
            const store = get();

            console.log('Initializing socket listeners...');

            // SAFETY MECHANISM: Clear any stuck sending states
            const { currentMessages } = get();
            let hasStuckMessages = false;
            const cleanedMessages = {};

            Object.keys(currentMessages).forEach(chatId => {
                const messages = currentMessages[chatId] || [];
                const cleanedChatMessages = messages.map(m => {
                    if (m.sending && m._id) {
                        // Real message shouldn't be in sending state
                        hasStuckMessages = true;
                        return { ...m, sending: false };
                    }
                    return m;
                });
                cleanedMessages[chatId] = cleanedChatMessages;
            });

            if (hasStuckMessages) {
                console.log('🔧 Cleared stuck sending states during initialization');
                set({ currentMessages: cleanedMessages });
            }

            // Clean up existing listeners
            socketService.off('messageReceived', store.handleMessageReceived);
            socketService.off('messageSent', store.handleMessageSent);
            socketService.off('onlineStatusUpdate', store.handleOnlineStatusUpdate);
            socketService.off('allOnlineUsers', store.handleAllOnlineUsers);
            socketService.off('unreadMessages', store.handleUnreadMessages);

            // Set up new listeners
            socketService.on('messageReceived', store.handleMessageReceived);
            socketService.on('messageSent', store.handleMessageSent);
            socketService.on('onlineStatusUpdate', store.handleOnlineStatusUpdate);
            socketService.on('allOnlineUsers', store.handleAllOnlineUsers);
            socketService.on('unreadMessages', store.handleUnreadMessages);

            // Connection status listeners
            socketService.on('authenticated', () => {
                console.log('Socket authenticated - setting connected state');
                store.setConnectionState({ connected: true, connecting: false });
            });

            socketService.on('connectionStatusChanged', (status) => {
                console.log('Connection status changed:', status);
                store.setConnectionState(status);
            });

            socketService.on('authError', (error) => {
                console.log('Auth error:', error);
                store.setConnectionState({
                    connected: false,
                    connecting: false,
                    error: error.message
                });
            });

            socketService.on('socketError', (error) => {
                console.log('Socket error:', error);
                store.setConnectionState({
                    connected: false,
                    connecting: false,
                    error: 'Socket connection error'
                });
            });
        },

        // Cleanup
        cleanup: () => {
            const store = get();

            // Clear all pending timeouts
            store.messageTimeouts.forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });

            // Remove all socket listeners
            socketService.off('messageReceived', store.handleMessageReceived);
            socketService.off('messageSent', store.handleMessageSent);
            socketService.off('onlineStatusUpdate', store.handleOnlineStatusUpdate);
            socketService.off('allOnlineUsers', store.handleAllOnlineUsers);
            socketService.off('unreadMessages', store.handleUnreadMessages);

            // Reset state
            set({
                isConnected: false,
                isConnecting: false,
                connectionError: null,
                chatList: [],
                currentMessages: {},
                selectedChat: null,
                onlineUsers: new Set(),
                unreadCounts: {},
                isSendingMessage: false,
                messageError: null,
                shouldRefetchChatList: false,
                messageTimeouts: new Map(),
            });
        },
    }))
);

// Utility selectors
export const useChatSelectors = () => {
    const store = useChatStore();

    return {
        // Get messages for currently selected chat
        getCurrentChatMessages: () => {
            if (!store.selectedChat) return [];
            const chatId = store.selectedChat.partnerId || store.selectedChat._id;
            return store.currentMessages[chatId] || [];
        },

        // Get unread count for a specific chat
        getUnreadCount: (chatId) => {
            return store.unreadCounts[chatId] || 0;
        },

        // Check if user is online
        isUserOnline: (userId) => {
            return store.onlineUsers.has(userId);
        },

        // Get connection status
        getConnectionStatus: () => ({
            connected: store.isConnected,
            connecting: store.isConnecting,
            error: store.connectionError,
        }),
    };
};