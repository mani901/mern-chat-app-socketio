import ChatArea from "@/components/chat/ChatArea";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatSideBar from "@/components/chat/ChatSideBar";

import { useState } from "react";

const Home = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileViewOpen, setIsMobileViewOpen] = useState(false);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    // On mobile, switch to chat view when a chat is selected
    setIsMobileViewOpen(true);
  };

  const handleBackToChats = () => {
    // On mobile, go back to chat list
    setIsMobileViewOpen(false);
    // Optionally clear selected chat
    // setSelectedChat(null);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar (left panel) - responsive behavior */}
      <div
        className={`
        w-full md:w-80 border-r flex flex-col bg-white
        ${
          // On mobile: show sidebar only when no chat is selected or mobile view is closed
          isMobileViewOpen ? "hidden md:flex" : "flex"
        }
      `}
      >
        <ChatSideBar onChatSelect={handleChatSelect} />
      </div>

      {/* Chat Screen (right panel) with fixed header - responsive behavior */}
      <div
        className={`
        flex-1 flex flex-col bg-gray-50
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
        <div className="flex-1 overflow-y-auto">
          <ChatArea selectedChat={selectedChat} />
        </div>
      </div>
    </div>
  );
};

export default Home;
