import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/useChat";
import { useChatStore, useChatSelectors } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMessageData, formatMessageTime } from "@/services/messageAPI";

const ChatArea = ({ selectedChat }) => {
  const [messageInput, setMessageInput] = useState("");
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Auth store
  const { user } = useAuthStore();
  
  // Chat store
  const {
    currentMessages,
    isSendingMessage,
    messageError,
    sendMessage,
    setCurrentMessages,
  } = useChatStore();
  
  const { getCurrentChatMessages } = useChatSelectors();
  
  // Fetch messages for selected chat
  const {
    data: fetchedMessages = [],
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    error: messagesError,
    refetch: refetchMessages
  } = useMessages(selectedChat?.partnerId || selectedChat?.id);
  
  // Get current chat messages from store or fetched data
  const messages = getCurrentChatMessages().length > 0 
    ? getCurrentChatMessages() 
    : fetchedMessages;

  console.log('ChatArea Debug:', {
    selectedChat,
    messagesFromStore: getCurrentChatMessages().length,
    messagesFromFetch: fetchedMessages.length,
    totalMessages: messages.length,
    isLoadingMessages,
    chatId: selectedChat?.partnerId || selectedChat?.id
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Update store when messages are fetched
  useEffect(() => {
    if (selectedChat && fetchedMessages.length > 0) {
      const chatId = selectedChat.partnerId || selectedChat.id;
      const formattedMessages = fetchedMessages.map(msg => 
        formatMessageData(msg, user?._id || user?.id)
      );
      setCurrentMessages(chatId, formattedMessages);
    }
  }, [fetchedMessages, selectedChat, user, setCurrentMessages]);

  // Clear messages when chat changes to ensure proper loading
  useEffect(() => {
    if (selectedChat) {
      const chatId = selectedChat.partnerId || selectedChat.id;
      // Only clear if we don't have messages for this chat
      const existingMessages = getCurrentChatMessages();
      if (existingMessages.length === 0 && !isLoadingMessages) {
        console.log('Clearing messages for new chat:', chatId);
      }
    }
  }, [selectedChat]);

  // Handle message errors
  useEffect(() => {
    if (isMessagesError) {
      toast.error(messagesError?.message || "Failed to load messages");
    }
  }, [isMessagesError, messagesError]);

  useEffect(() => {
    if (messageError) {
      toast.error(messageError);
    }
  }, [messageError]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedChat) {
      return;
    }

    if (!selectedChat.partnerId && !selectedChat.id) {
      toast.error("Invalid chat selected");
      return;
    }

    const receiverId = selectedChat.partnerId || selectedChat.id;
    const content = messageInput.trim();
    
    // Clear input immediately for better UX
    setMessageInput("");
    
    try {
      const success = await sendMessage(receiverId, content);
      if (success) {
        console.log("Message sent successfully");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message input on error
      setMessageInput(content);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatDisplayTime = (timestamp) => {
    if (!timestamp) return "";
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return formatMessageTime(timestamp);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a chat to start messaging
          </h3>
          <p className="text-gray-500">
            Choose a conversation from the sidebar to begin chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Messages Area with fixed height */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full p-3 md:p-4" ref={scrollAreaRef}>
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-2">
                  No messages yet. Start the conversation!
                </p>
                <p className="text-sm text-gray-400">
                  Send a message to {selectedChat.name || selectedChat.username}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.isOwn !== undefined ? message.isOwn : 
                  (message.sender?._id === user?._id || message.sender === user?._id);
                
                // Get proper sender information from message
                const messageUsername = isOwn ? (user?.username || 'You') : (message.sender?.username || 'Unknown');
                const messageAvatar = isOwn ? user?.avatar : message.sender?.avatar;
                
                console.log('Message debug info:', {
                  messageId: message._id,
                  messageSenderId: message.sender?._id || message.sender,
                  messageSenderUsername: message.sender?.username,
                  currentUserId: user?._id,
                  currentUserUsername: user?.username,
                  isOwnFromMessage: message.isOwn,
                  isOwnCalculated: isOwn,
                  messageUsername,
                  messageAvatar,
                  messageContent: message.content
                });
                
                return (
                  <div
                    key={message._id || message.tempId || index}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn && (
                      <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
                        <AvatarImage 
                          src={messageAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(messageUsername)}&background=random`}
                          alt={messageUsername} 
                        />
                        <AvatarFallback>
                          {messageUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[280px] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg relative ${
                        isOwn
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      } ${
                        message.sending ? "opacity-70" : ""
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-1 space-x-2">
                        <p className="text-xs opacity-70">
                          {formatDisplayTime(message.timestamp)}
                        </p>
                        {message.sending && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {isOwn && !message.sending && (
                          <span className="text-xs opacity-70">
                            {message.read ? "Read" : "Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isOwn && (
                      <Avatar className="w-8 h-8 ml-2 flex-shrink-0">
                        <AvatarImage 
                          src={messageAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(messageUsername)}&background=random`}
                          alt={messageUsername} 
                        />
                        <AvatarFallback>
                          {messageUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="p-3 md:p-4 border-t bg-gray-50 flex-shrink-0">
        {isMessagesError && (
          <div className="mb-2">
            <p className="text-xs text-red-600 mb-1">
              Failed to load messages. 
              <button 
                onClick={() => refetchMessages()}
                className="underline ml-1 hover:text-red-800"
              >
                Retry
              </button>
            </p>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder={`Message ${selectedChat.name || selectedChat.username}...`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSendingMessage}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 h-10 md:h-auto focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-sm"
          />
          <Button 
            type="submit"
            disabled={!messageInput.trim() || isSendingMessage}
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-10 w-10 md:h-auto md:w-auto"
          >
            {isSendingMessage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
