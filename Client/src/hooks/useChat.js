import { useQuery } from '@tanstack/react-query';
import { messageAPI, formatChatData } from '@/services/messageAPI';
import { useChatStore } from '@/store/useChatStore';

// Hook for fetching chat list
export function useChatList() {
  const setChatList = useChatStore(state => state.setChatList);

  return useQuery({
    queryKey: ['chatList'],
    queryFn: async () => {
      const chatData = await messageAPI.getChatList();

      // Format the chat data for UI consumption
      const formattedChats = chatData.map(chat => formatChatData(chat));

      // Update the chat store
      setChatList(formattedChats);

      return formattedChats;
    },
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    onError: (error) => {
      console.error('Error fetching chat list:', error);
    },
  });
}

// Hook for fetching messages for a specific chat
export function useMessages(userId) {
  const { setCurrentMessages } = useChatStore();

  return useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      if (!userId) return [];

      const messages = await messageAPI.getMessages(userId);

      // Update the chat store with messages
      setCurrentMessages(userId, messages);

      return messages;
    },
    enabled: !!userId, // Only run query if userId is provided
    retry: 2,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      console.error('Error fetching messages:', error);
    },
  });
}

// Legacy hook for backward compatibility - now returns chat list
export function useChat() {
  return useChatList();
}