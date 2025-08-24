import { useMutation } from '@tanstack/react-query';
import api from '@/services/axios';
import { toast } from 'react-hot-toast';

const RegisterAPI = async (formData) => {
  const res = await api.post('/auth/register', formData);
  return res.data;
};

export function useRegister() {
  return useMutation({
    mutationFn: RegisterAPI,

    onSuccess: (data) => {
      console.log(data);
      toast.success('Registration successful');
    },

  });
}