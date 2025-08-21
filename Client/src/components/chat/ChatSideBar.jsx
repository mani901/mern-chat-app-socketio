import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Dummy data (15 items)
const allChats = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "https://i.pravatar.cc/150?img=1",
    lastMessage: "Hey, are we still meeting tomorrow?",
    time: "2:30 PM",
    unread: true,
  },
  {
    id: 2,
    name: "Team Alpha",
    avatar: "https://i.pravatar.cc/150?img=2",
    lastMessage: "Sarah: Don't forget the presentation!",
    time: "1:15 PM",
    unread: false,
  },
  {
    id: 3,
    name: "Sarah Williams",
    avatar: "https://i.pravatar.cc/150?img=3",
    lastMessage: "Sent a photo",
    time: "12:45 PM",
    unread: true,
  },
  {
    id: 4,
    name: "Family Group",
    avatar: "https://i.pravatar.cc/150?img=4",
    lastMessage: "Mom: Dinner at 7?",
    time: "11:20 AM",
    unread: false,
  },
  {
    id: 5,
    name: "Mike Chen",
    avatar: "https://i.pravatar.cc/150?img=5",
    lastMessage: "Ok, sounds good!",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 6,
    name: "Project Phoenix",
    avatar: "https://i.pravatar.cc/150?img=6",
    lastMessage: "John: Let's sync up this week.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: 7,
    name: "Emma Davis",
    avatar: "https://i.pravatar.cc/150?img=7",
    lastMessage: "Thanks for the feedback!",
    time: "Wednesday",
    unread: false,
  },
  {
    id: 8,
    name: "Dev Team Chat",
    avatar: "https://i.pravatar.cc/150?img=8",
    lastMessage: "Lena: Bug fix deployed to staging.",
    time: "Tuesday",
    unread: false,
  },
  {
    id: 9,
    name: "Olivia Martinez",
    avatar: "https://i.pravatar.cc/150?img=9",
    lastMessage: "Are you coming to the party?",
    time: "Monday",
    unread: false,
  },
  {
    id: 10,
    name: "Marketing Squad",
    avatar: "https://i.pravatar.cc/150?img=10",
    lastMessage: "New campaign ideas due Friday.",
    time: "Monday",
    unread: true,
  },
  {
    id: 11,
    name: "James Wilson",
    avatar: "https://i.pravatar.cc/150?img=11",
    lastMessage: "Can you review the doc?",
    time: "Last week",
    unread: false,
  },
  {
    id: 12,
    name: "Study Group 2024",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Final exam prep starts now.",
    time: "Last week",
    unread: false,
  },
  {
    id: 13,
    name: "Nina Patel",
    avatar: "https://i.pravatar.cc/150?img=13",
    lastMessage: "Sent a voice message",
    time: "Last week",
    unread: true,
  },
  {
    id: 14,
    name: "Freelancers Hub",
    avatar: "https://i.pravatar.cc/150?img=14",
    lastMessage: "New job posted: UI Designer needed.",
    time: "2 weeks ago",
    unread: false,
  },
  {
    id: 15,
    name: "David Kim",
    avatar: "https://i.pravatar.cc/150?img=15",
    lastMessage: "Let me know when you're free.",
    time: "2 weeks ago",
    unread: false,
  },
];

const groups = allChats.filter(
  (chat) =>
    chat.name.includes("Team") ||
    chat.name.includes("Group") ||
    chat.name.includes("Squad")
);

const people = allChats.filter(
  (chat) =>
    !chat.name.includes("Team") &&
    !chat.name.includes("Group") &&
    !chat.name.includes("Squad")
);

const ChatItem = ({ chat }) => (
  <div
    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
      chat.unread ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
    }`}
  >
    <Avatar className="h-12 w-12 flex-shrink-0">
      <AvatarImage src={chat.avatar} alt={chat.name} />
      <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">
        {chat.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {chat.name}
        </p>
        <p className="text-xs text-gray-500 ml-2 whitespace-nowrap">
          {chat.time}
        </p>
      </div>
      <p
        className={`text-sm truncate ${
          chat.unread ? "text-gray-900 font-medium" : "text-gray-500"
        }`}
      >
        {chat.lastMessage}
      </p>
    </div>
    {chat.unread && (
      <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500"></span>
    )}
  </div>
);

const ChatSideBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filterChats = (chats) => {
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredAll = filterChats(allChats);
  const filteredGroups = filterChats(groups);
  const filteredPeople = filterChats(people);

  return (
    <div className="w-full max-w-xs border-r border-gray-200 h-screen flex flex-col bg-white">
      {/* Fixed Header */}
      <div className="p-6 pt-8 pb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chats</h2>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Fixed Tabs */}
      <div className="px-6 pb-4 flex-shrink-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 h-10">
            <TabsTrigger
              value="all"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Groups
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              People
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full overflow-y-auto">
          <div className="px-6 pb-6">
            {activeTab === "all" && (
              <div className="space-y-1">
                {filteredAll.length > 0 ? (
                  filteredAll.map((chat) => (
                    <ChatItem key={chat.id} chat={chat} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No chats found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "groups" && (
              <div className="space-y-1">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((chat) => (
                    <ChatItem key={chat.id} chat={chat} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No groups found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "people" && (
              <div className="space-y-1">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((chat) => (
                    <ChatItem key={chat.id} chat={chat} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No people found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
