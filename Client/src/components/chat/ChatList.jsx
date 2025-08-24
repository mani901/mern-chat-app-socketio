import ChatItem from "./ChatItem";

const ChatList = ({ chats, onChatClick, selectedChatId }) => {
  if (chats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No chats found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onClick={onChatClick}
          isSelected={selectedChatId === chat.id}
        />
      ))}
    </div>
  );
};

export default ChatList;
