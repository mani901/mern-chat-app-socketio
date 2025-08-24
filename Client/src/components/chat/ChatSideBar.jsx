import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useChat } from "@/hooks/useChat";
import { useChatFilter } from "@/hooks/useChatFilter";
import { dummyChats } from "@/data/dummyChats";
import SearchInput from "./SearchInput";
import ChatTabs from "./ChatTabs";
import ChatList from "./ChatList";
import ChatModal from "./ChatModal";
const ChatSideBar = ({ onChatSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { filteredAll, filteredGroups, filteredPeople } = useChatFilter(
    dummyChats,
    searchTerm
  );

  const handleChatClick = (chat) => {
    // Update local selected state for visual feedback
    setSelectedChatId(chat.id);

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

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* Fixed Header */}
      <div className="p-4 md:p-6 pt-6 md:pt-8 pb-4 flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
          Chats
        </h2>
        <ChatModal />

        <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
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
            ) : (
              <ChatList
                chats={getCurrentChats()}
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
