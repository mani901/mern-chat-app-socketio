import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useChat } from "@/hooks/useChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

const ChatModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: users, isLoading, isError } = useChat();

  useEffect(() => {
    if (!isLoading && users) {
      toast.success("✅ Users fetched successfully!");
      console.log(users);
    }
    if (isError) {
      toast.error("❌ Failed to fetch users");
    }
  }, [users, isLoading, isError]);
  // Sample user data
  const usersD = [
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "/avatars/01.png",
      status: "online",
    },
    { id: 2, name: "Sam Smith", avatar: "/avatars/02.png", status: "away" },
    {
      id: 3,
      name: "Taylor Reed",
      avatar: "/avatars/03.png",
      status: "offline",
    },
    { id: 4, name: "Jordan Lee", avatar: "/avatars/04.png", status: "online" },
    { id: 5, name: "Casey Brown", avatar: "/avatars/05.png", status: "away" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">Chats</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-grow">
          <ul className="divide-y divide-gray-100">
            {users.map((user) => (
              <li
                key={user._id}
                className="p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage
                          src={usersD[0].avatar}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-indigo-100 text-indigo-800 font-medium">
                          {user.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${getStatusColor(
                          user.isOnline ? "online" : "offline"
                        )}`}
                      ></span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {user.isOnline ? "online" : "offline"}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="rounded-full px-4"
                    onClick={() => console.log(`Message ${user.name}`)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
