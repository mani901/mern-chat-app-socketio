import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ChatHeader = ({ selectedChat, onBackClick, showBackButton }) => {
  // Default chat info if no chat is selected
  const defaultChat = {
    name: "Select a chat",
    avatar: "https://i.pravatar.cc/150?img=5",
    isOnline: false,
  };

  const chatInfo = selectedChat
    ? {
        name: selectedChat.name,
        avatar: selectedChat.avatar,
        isOnline: selectedChat.unread || Math.random() > 0.5, // Simulate online status
      }
    : defaultChat;

  return (
    <div className="flex items-center p-4 border-b bg-white flex-shrink-0">
      {/* Mobile Back Button */}
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackClick}
          className="mr-3 md:hidden p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <Avatar className="w-10 h-10 mr-3">
        <AvatarImage src={chatInfo.avatar} alt={chatInfo.name} />
        <AvatarFallback>{chatInfo.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">{chatInfo.name}</h2>
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              chatInfo.isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
          <span
            className={`text-sm ${
              chatInfo.isOnline ? "text-green-600" : "text-gray-500"
            }`}
          >
            {chatInfo.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
