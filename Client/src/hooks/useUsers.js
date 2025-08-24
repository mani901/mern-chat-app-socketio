import { useQuery } from '@tanstack/react-query';
import { userAPI, formatUserData } from '@/services/messageAPI';

// Hook for fetching all users (for chat initiation)
export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const users = await userAPI.getUsers();

            // Format user data for UI consumption
            return users.map(user => formatUserData(user));
        },
        retry: 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false, // Users don't change frequently
        onError: (error) => {
            console.error('Error fetching users:', error);
        },
    });
}

// Hook for searching users
export function useUserSearch(query) {
    return useQuery({
        queryKey: ['userSearch', query],
        queryFn: async () => {
            if (!query || query.trim().length < 2) {
                return [];
            }

            const users = await userAPI.searchUsers(query);
            return users.map(user => formatUserData(user));
        },
        enabled: query && query.trim().length >= 2,
        retry: 1,
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60 * 2, // 2 minutes
        onError: (error) => {
            console.error('Error searching users:', error);
        },
    });
}

// Hook for getting user profile
export function useUserProfile() {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const profile = await userAPI.getProfile();
            return formatUserData(profile.user);
        },
        retry: 2,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        onError: (error) => {
            console.error('Error fetching user profile:', error);
        },
    });
}