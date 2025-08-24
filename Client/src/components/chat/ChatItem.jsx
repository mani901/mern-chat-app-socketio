import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatItem = ({ chat, onClick, isSelected }) => {
  return (
    <div
      className={`flex items-center space-x-3 p-4 md:p-3 rounded-lg cursor-pointer transition-colors min-h-[72px] md:min-h-[60px] touch-manipulation ${
        isSelected
          ? "bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-500"
          : chat.unread
          ? "bg-blue-50 hover:bg-blue-100 active:bg-blue-200"
          : "hover:bg-gray-50 active:bg-gray-100"
      }`}
      onClick={() => onClick && onClick(chat)}
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
};

export default ChatItem;
