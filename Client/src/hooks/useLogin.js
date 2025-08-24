import { useMutation } from '@tanstack/react-query';
import api from '@/services/axios';
import { useAuthStore } from '@/store/useAuthStore';

const loginAPI = async (formData) => {
  const res = await api.post('/auth/login', formData);
  return res.data;
};

export function useLogin() {
  return useMutation({
    mutationFn: loginAPI,

    onSuccess: (data) => {
      const { user, token } = data;
      console.log(data);
      // Save token to localStorage (so interceptor can use it)
      localStorage.setItem('token', token);
      localStorage.setItem('auth-user', JSON.stringify(user));

      // Update Zustand
      useAuthStore.getState().setAuth(user, token);
    },

  });
}