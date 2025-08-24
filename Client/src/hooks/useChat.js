// hooks/useFetchUsers.js
import { useQuery } from '@tanstack/react-query';
import api from '@/services/axios';

const fetchUsers = async () => {
  const res = await api.get('/auth/users');
  return res.data;
};

export function useChat() {
  return useQuery({
    queryKey: ['users'], // Unique key for caching
    queryFn: fetchUsers,
    // Optional: control refetching
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
  });
}