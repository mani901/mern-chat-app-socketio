import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useChatList } from "@/hooks/useChat";
import { useChatStore, useChatSelectors } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatFilter } from "@/hooks/useChatFilter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import SearchInput from "./SearchInput";
import ChatTabs from "./ChatTabs";
import ChatList from "./ChatList";
import ChatModal from "./ChatModal";
import socketService from "@/services/socket";

const ChatSideBar = ({ onChatSelect, onChatStart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChatId, setSelectedChatId] = useState(null);
  
  // Navigation hook for redirect
  const navigate = useNavigate();

  // React Query for fetching chat data
  const { data: chats = [], isLoading, isError, error, refetch } = useChatList();

  // Chat store for real-time updates
  const {
    chatList,
    isConnected,
    connectionError,
    clearUnreadCount,
    shouldRefetchChatList,
    resetRefetchFlag,
  } = useChatStore();

  // Auth store for user info and logout
  const { user, logout } = useAuthStore();

  const { isUserOnline, getUnreadCount } = useChatSelectors();

  // Handle logout functionality
  const handleLogout = () => {
    try {
      // Disconnect socket before logging out
      socketService.disconnect();
      
      // Clear chat store
      const { cleanup } = useChatStore.getState();
      cleanup();
      
      
      // Logout from auth store
      logout();
      
      // Redirect to login page
      navigate('/login');
      
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error during logout");
    }
  };

  // Use real-time chat list from store if available, fallback to query data
  const realTimeChats = chatList.length > 0 ? chatList : chats;

  // Filter chats based on search and tab
  const { filteredAll, filteredGroups, filteredPeople } = useChatFilter(
    realTimeChats,
    searchTerm
  );

  // Handle connection errors
  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "❌ Failed to fetch chats");
    }
  }, [isError, error]);

  // Handle connection status
  useEffect(() => {
    if (connectionError) {
      toast.error(`Connection error: ${connectionError}`);
    } else if (isConnected) {
      toast.success("✅ Connected to chat server");
    }
  }, [isConnected, connectionError]);

  // Show success when chats are loaded
  useEffect(() => {
    if (!isLoading && realTimeChats.length > 0) {
     
    }
  }, [realTimeChats, isLoading]);

  // Auto-refetch when new conversations are detected
  useEffect(() => {
    if (shouldRefetchChatList) {
      console.log('Auto-refetching chat list due to new conversation');
      refetch();
      resetRefetchFlag();
    }
  }, [shouldRefetchChatList, refetch, resetRefetchFlag]);

  const handleChatClick = (chat) => {
    // Update local selected state for visual feedback
    setSelectedChatId(chat.partnerId || chat.id);

    // Clear unread count for this chat
    if (chat.partnerId || chat.id) {
      clearUnreadCount(chat.partnerId || chat.id);
    }

    // Call the parent callback to update the selected chat
    if (onChatSelect) {
      onChatSelect(chat);
    }
    console.log("Selected chat:", chat);
  };

  const getCurrentChats = () => {
    switch (activeTab) {
      case "groups":
        return filteredGroups;
      case "people":
        return filteredPeople;
      default:
        return filteredAll;
    }
  };

  // Enhance chat data with real-time information
  const enhancedChats = getCurrentChats().map(chat => ({
    ...chat,
    isOnline: isUserOnline(chat.partnerId || chat.id),
    unreadCount: getUnreadCount(chat.partnerId || chat.id),
    unread: getUnreadCount(chat.partnerId || chat.id) > 0,
  }));

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* User Profile Section */}
      <div className="p-4 md:p-6 pt-4 md:pt-6 pb-3 flex-shrink-0 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`}
                alt={user?.username || 'User'} 
              />
              <AvatarFallback>
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {user?.username || 'User'}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed Header */}
      <div className="p-4 md:p-6 pt-3 md:pt-4 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Chats
          </h2>
          
          {/* Connection status indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? "bg-green-500"
                  : connectionError
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
              title={
                isConnected
                  ? "Connected"
                  : connectionError
                  ? "Connection error"
                  : "Connecting..."
              }
            />
            <ChatModal onChatStart={onChatStart} />
          </div>
        </div>

        <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        {/* Retry button for failed connections */}
        {(isError || connectionError) && (
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Retry loading chats
          </button>
        )}
      </div>

      {/* Fixed Tabs */}
      <div className="px-4 md:px-6 pb-3 md:pb-4 flex-shrink-0">
        <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full overflow-y-auto">
          <div className="px-3 md:px-6 pb-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Loading chats...</p>
              </div>
            ) : enhancedChats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  {searchTerm
                    ? "No chats found matching your search"
                    : "No chats yet. Start a conversation!"}
                </p>
              </div>
            ) : (
              <ChatList
                chats={enhancedChats}
                onChatClick={handleChatClick}
                selectedChatId={selectedChatId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
