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
    // clear localStorage
    localStorage.removeItem('auth-user');
    localStorage.removeItem('token');

    set({
      user: null,
      token: null,
      isLoggedIn: false,
    });
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