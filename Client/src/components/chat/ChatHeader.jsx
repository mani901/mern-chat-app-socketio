import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";

const ChatArea = () => {
  // Sample messages data
  const messages = [
    {
      id: 1,
      sender: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
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
    {
      id: 3,
      sender: "Sarah Williams",
      avatar: "https://i.pravatar.cc/150?img=3",
      content: "Sent a photo",
      timestamp: "12:45 PM",
      isOwn: false,
    },
    {
      id: 4,
      sender: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      content:
        "Perfect! See you there. Should I bring the documents we discussed?",
      timestamp: "2:40 PM",
      isOwn: false,
    },
    {
      id: 5,
      sender: "You",
      avatar: "https://i.pravatar.cc/150?img=2",
      content: "Yes, that would be great. Also bring your laptop if possible.",
      timestamp: "2:42 PM",
      isOwn: true,
    },
    {
      id: 6,
      sender: "Sarah Williams",
      avatar: "https://i.pravatar.cc/150?img=3",
      content: "Can I join the meeting as well? I have some ideas to share.",
      timestamp: "2:45 PM",
      isOwn: false,
    },
    {
      id: 7,
      sender: "You",
      avatar: "https://i.pravatar.cc/150?img=2",
      content:
        "Absolutely! The more the merrier. We're meeting at the downtown office.",
      timestamp: "2:47 PM",
      isOwn: true,
    },
    {
      id: 8,
      sender: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      content: "Great! I'll bring coffee for everyone.",
      timestamp: "2:50 PM",
      isOwn: false,
    },
    {
      id: 9,
      sender: "Sarah Williams",
      avatar: "https://i.pravatar.cc/150?img=3",
      content: "You're the best! Looking forward to it.",
      timestamp: "2:52 PM",
      isOwn: false,
    },
    {
      id: 10,
      sender: "You",
      avatar: "https://i.pravatar.cc/150?img=2",
      content: "This is going to be a productive meeting. Thanks everyone!",
      timestamp: "2:55 PM",
      isOwn: true,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b bg-white flex-shrink-0">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src="https://i.pravatar.cc/150?img=5" alt="Chat Name" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Chat Name</h2>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-600">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area with fixed height */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={`${message.id}-${message.timestamp}`}
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
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
      <div className="p-4 border-t bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
