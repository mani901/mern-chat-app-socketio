import ChatArea from "@/components/chat/ChatArea";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatSideBar from "@/components/chat/ChatSideBar";

import React, { useState } from "react";

const Home = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar (left panel) - keep as is */}
      <div className="w-80 border-r flex flex-col bg-white">
        <ChatSideBar />
      </div>

      {/* Chat Screen (right panel) with fixed header */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Fixed Chat Header - stays at top during scrolling */}
        <ChatHeader />

        {/* Chat Content - scrolls under the header */}
        <div className="flex-1 overflow-y-auto p-4">
          <ChatArea />
        </div>
      </div>
    </div>
  );
};

export default Home;
