import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useUsers } from "@/hooks/useUsers";
import { useChatStore, useChatSelectors } from "@/store/useChatStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

const ChatModal = ({ onChatStart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch users data
  const { data: users = [], isLoading, isError, error } = useUsers();
  
  // Chat store
  const { setSelectedChat } = useChatStore();
  const { isUserOnline } = useChatSelectors();

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "❌ Failed to fetch users");
    }
  }, [isError, error]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.displayName?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (isOnline) => {
    return isOnline ? "bg-green-500" : "bg-gray-400";
  };

  const handleStartChat = (user) => {
    if (!user || !user._id) {
      toast.error("Invalid user selected");
      return;
    }

    console.log(`Starting chat with user:`, user);
    
    // Create a chat object that matches the expected format
    const chatData = {
      partnerId: user._id,
      id: user._id,
      name: user.username || user.displayName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isOnline: isUserOnline(user._id), // Use real-time status
      lastMessage: "",
      lastMessageTimestamp: null,
      time: "",
      unread: false,
      unreadCount: 0,
    };

    // Set as selected chat in store
    setSelectedChat(chatData);
    
    // Call parent callback if provided
    if (onChatStart) {
      onChatStart(chatData);
    }
    
    // Close modal
    setIsOpen(false);
    setSearchQuery("");
    
    toast.success(`Started chat with ${user.username}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full w-10 h-10 p-0 shadow-lg bg-blue-600 hover:bg-blue-700">
          <MessageCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Start New Chat
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "No users found matching your search"
                  : "No users available"}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const isOnline = isUserOnline(user._id);
                
                return (
                  <li
                    key={user._id}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage
                              src={user.avatar}
                              alt={user.username}
                            />
                            <AvatarFallback className="bg-indigo-100 text-indigo-800 font-medium">
                              {(user.username || user.displayName || 'U')
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                              getStatusColor(isOnline)
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.username || user.displayName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {isOnline ? "online" : "offline"}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="rounded-full px-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStartChat(user)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Footer with user count */}
        {!isLoading && (
          <div className="px-6 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} available
              {searchQuery && ` (filtered from ${users.length})`}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
