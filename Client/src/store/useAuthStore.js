// store/useAuthStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // Initial state
  user: null,
  token: null,
  isLoggedIn: false,

  // Actions to update state
  setAuth: (userData, jwtToken) =>
    set({
      user: userData,
      token: jwtToken,
      isLoggedIn: true,
    }),

  logout: () => {
    // Clear localStorage completely
    localStorage.removeItem('auth-user');
    localStorage.removeItem('token');

    // Also clear any other auth-related items
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('lastLoginTime');

    // Reset store state
    set({
      user: null,
      token: null,
      isLoggedIn: false,
    });

    console.log('User logged out successfully');
  },


  initializeAuth: (userData, jwtToken) => {
    if (userData && jwtToken) {
      set({
        user: userData,
        token: jwtToken,
        isLoggedIn: true,
      });
    }
  },
}));