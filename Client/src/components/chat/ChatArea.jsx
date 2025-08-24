import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const ChatArea = ({ selectedChat }) => {
  // Generate messages based on selected chat
  const getMessagesForChat = (chat) => {
    if (!chat) return [];

    // Sample messages data - in real app this would come from API
    const messageTemplates = {
      "Alex Johnson": [
        {
          id: 1,
          sender: "Alex Johnson",
          avatar: chat.avatar,
          content: "Hey, are we still meeting tomorrow?",
          timestamp: "2:30 PM",
          isOwn: false,
        },
        {
          id: 2,
          sender: "You",
          avatar: "https://i.pravatar.cc/150?img=2",
          content: "Yes, I'll be there at 3 PM",
          timestamp: "2:35 PM",
          isOwn: true,
        },
      ],
      "Sarah Williams": [
        {
          id: 1,
          sender: "Sarah Williams",
          avatar: chat.avatar,
          content:
            "Can I join the meeting as well? I have some ideas to share.",
          timestamp: "2:45 PM",
          isOwn: false,
        },
        {
          id: 2,
          sender: "You",
          avatar: "https://i.pravatar.cc/150?img=2",
          content: "Absolutely! The more the merrier.",
          timestamp: "2:47 PM",
          isOwn: true,
        },
      ],
    };

    return (
      messageTemplates[chat.name] || [
        {
          id: 1,
          sender: chat.name,
          avatar: chat.avatar,
          content: `Hello! This is a conversation with ${chat.name}.`,
          timestamp: "Just now",
          isOwn: false,
        },
        {
          id: 2,
          sender: "You",
          avatar: "https://i.pravatar.cc/150?img=2",
          content: "Hi there! Nice to chat with you.",
          timestamp: "Just now",
          isOwn: true,
        },
      ]
    );
  };

  const messages = getMessagesForChat(selectedChat);

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
        <ScrollArea className="h-full p-3 md:p-4">
          <div className="space-y-3 md:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {!message.isOwn && (
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarImage src={message.avatar} alt={message.sender} />
                    <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[280px] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
                    message.isOwn
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                </div>
                {message.isOwn && (
                  <Avatar className="w-8 h-8 ml-2">
                    <AvatarImage
                      src="https://i.pravatar.cc/150?img=2"
                      alt="You"
                    />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="p-3 md:p-4 border-t bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 h-10 md:h-auto focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-sm"
          />
          <Button className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 flex-shrink-0 h-10 w-10 md:h-auto md:w-auto">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
