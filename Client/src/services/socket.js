import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnecting = false;
        this.connectionAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map(); // Store event listeners
    }

    connect() {
        if (this.socket?.connected || this.isConnecting) {
            return this.socket;
        }

        const { token } = useAuthStore.getState();
        if (!token) {
            console.error('No token available for socket connection');
            return null;
        }

        this.isConnecting = true;
        console.log('Connecting to socket server...');

        this.socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:8080', {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            timeout: 20000,
        });

        this.setupEventHandlers();
        this.socket.connect();

        return this.socket;
    }

    setupEventHandlers() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket connected successfully');
            this.isConnecting = false;
            this.connectionAttempts = 0;

            // Notify listeners about successful connection
            this.emit('connectionStatusChanged', { connected: true, connecting: false });

            this.authenticate();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnecting = false;

            // Notify listeners about disconnection
            this.emit('connectionStatusChanged', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnecting = false;
            this.connectionAttempts++;

            // Notify listeners about connection error
            this.emit('connectionError', { error, attempts: this.connectionAttempts });
        });

        this.socket.on('authenticated', (data) => {
            console.log('Socket authenticated successfully:', data);
            this.emit('authenticated', data);
        });

        this.socket.on('error', (error) => {
            console.error('Socket authentication error:', error);
            this.emit('authError', error);
        });

        // Add general socket error handler
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.emit('socketError', error);
        });

        this.socket.on('receiveMessage', (message) => {
            console.log('New message received:', message);
            this.emit('messageReceived', message);
        });

        this.socket.on('messageSent', (response) => {
            console.log('Message sent confirmation:', response);
            this.emit('messageSent', response);
        });

        this.socket.on('onlineStatus', (statusData) => {
            console.log('Online status update:', statusData);
            this.emit('onlineStatusUpdate', statusData);
        });

        this.socket.on('allOnlineUsers', (userIds) => {
            console.log('All online users received:', userIds);
            this.emit('allOnlineUsers', userIds);
        });

        this.socket.on('unreadMessages', (unreadData) => {
            console.log('Unread messages:', unreadData);
            this.emit('unreadMessages', unreadData);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            this.authenticate();
            this.emit('reconnected', { attemptNumber });
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('Socket reconnection failed:', error);
            this.emit('reconnectError', error);
        });
    }

    authenticate() {
        if (!this.socket?.connected) {
            console.error('Socket not connected, cannot authenticate');
            return;
        }

        const { token } = useAuthStore.getState();
        if (!token) {
            console.error('No token available for authentication');
            return;
        }

        console.log('Authenticating socket connection...');
        this.socket.emit('authenticate', token);
    }

    sendMessage(receiverId, content) {
        console.log('Socket sendMessage called:', { receiverId, content, connected: this.socket?.connected });

        if (!this.socket?.connected) {
            console.error('Socket not connected, cannot send message');
            return false;
        }

        if (!receiverId || !content?.trim()) {
            console.error('Invalid message data:', { receiverId, content });
            return false;
        }

        console.log('Emitting sendMessage event:', { receiverId: receiverId.toString(), content: content.trim() });
        this.socket.emit('sendMessage', {
            receiverId: receiverId.toString(),
            content: content.trim()
        });

        console.log('Message sent successfully via socket');
        return true;
    }

    // Event listener management
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return cleanup function
        return () => {
            this.off(event, callback);
        };
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in socket event listener:', error);
                }
            });
        }
    }

    disconnect() {
        if (this.socket) {
            console.log('Disconnecting socket...');
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnecting = false;
        this.listeners.clear();
    }

    // Utility methods
    isConnected() {
        return this.socket?.connected || false;
    }

    getConnectionState() {
        return {
            connected: this.isConnected(),
            connecting: this.isConnecting,
            attempts: this.connectionAttempts,
        };
    }
}

// Create and export singleton instance
const socketService = new SocketService();
export default socketService;

// Export individual methods for convenience
export const {
    connect,
    disconnect,
    sendMessage,
    on,
    off,
    isConnected,
    getConnectionState
} = socketService;