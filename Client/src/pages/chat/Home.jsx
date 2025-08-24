import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ChatArea from "@/components/chat/ChatArea";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatSideBar from "@/components/chat/ChatSideBar";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import socketService from "@/services/socket";

const Home = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileViewOpen, setIsMobileViewOpen] = useState(false);
  
  // Store hooks
  const { 
    setSelectedChat: setStoreChatSelected,
    initializeSocketListeners,
    cleanup: cleanupChatStore,
    isConnected,
    connectionError
  } = useChatStore();
  
  const { isLoggedIn, user, token } = useAuthStore();

  // Initialize socket connection and listeners
  useEffect(() => {
    if (isLoggedIn && token && user) {
      console.log('Initializing socket connection for user:', user.username);
      
      // Initialize socket listeners first
      initializeSocketListeners();
      
      // Connect to socket
      const socket = socketService.connect();
      
      if (socket) {
        console.log('Socket connection initiated');
      } else {
        console.error('Failed to initiate socket connection');
        toast.error('Failed to connect to chat server');
      }
    }
    
    // Cleanup function
    return () => {
      if (!isLoggedIn || !token) {
        console.log('Cleaning up socket connection');
        socketService.disconnect();
        cleanupChatStore();
      }
    };
  }, [isLoggedIn, token, user, initializeSocketListeners, cleanupChatStore]);
  
  // Handle connection status changes
  useEffect(() => {
    if (connectionError) {
      toast.error(`Connection error: ${connectionError}`);
    } else if (isConnected) {
      console.log('Successfully connected to chat server');
    }
  }, [isConnected, connectionError]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      console.log('User not logged in, should redirect to login');
      // Note: Add redirect logic here if needed
    }
  }, [isLoggedIn]);

  const handleChatSelect = (chat) => {
    console.log('Chat selected:', chat);
    
    // Update local state
    setSelectedChat(chat);
    
    // Update store state
    setStoreChatSelected(chat);
    
    // On mobile, switch to chat view when a chat is selected
    setIsMobileViewOpen(true);
    
    console.log('Mobile view opened:', true);
  };

  const handleChatStart = (chatData) => {
    console.log('Starting new chat:', chatData);
    handleChatSelect(chatData);
  };

  const handleBackToChats = () => {
    // On mobile, go back to chat list
    setIsMobileViewOpen(false);
    console.log('Mobile view closed, back to chat list');
    // Keep selected chat so it can be resumed
  };

  // Show loading state while initializing
  if (!isLoggedIn || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (left panel) - responsive behavior */}
      <div
        className={`
        w-full md:w-80 border-r flex flex-col bg-white shadow-sm
        ${
          // On mobile: show sidebar only when no chat is selected or mobile view is closed
          isMobileViewOpen ? "hidden md:flex" : "flex"
        }
      `}
      >
        <ChatSideBar 
          onChatSelect={handleChatSelect}
          onChatStart={handleChatStart}
        />
      </div>

      {/* Chat Screen (right panel) with fixed header - responsive behavior */}
      <div
        className={`
        flex-1 flex flex-col bg-white
        ${
          // On mobile: show chat area only when a chat is selected and mobile view is open
          isMobileViewOpen ? "flex" : "hidden md:flex"
        }
      `}
      >
        {/* Fixed Chat Header - stays at top during scrolling */}
        <ChatHeader
          selectedChat={selectedChat}
          onBackClick={handleBackToChats}
          showBackButton={isMobileViewOpen}
        />

        {/* Chat Content - scrolls under the header */}
        <div className="flex-1 overflow-hidden">
          <ChatArea selectedChat={selectedChat} />
        </div>
      </div>
      
      {/* Connection status indicator (optional - for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <div 
            className={`px-2 py-1 rounded text-xs text-white ${
              isConnected 
                ? 'bg-green-600' 
                : connectionError 
                ? 'bg-red-600' 
                : 'bg-yellow-600'
            }`}
            title={isConnected ? 'Connected' : connectionError || 'Connecting...'}
          >
            {isConnected ? '🟢' : connectionError ? '🔴' : '🟡'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
