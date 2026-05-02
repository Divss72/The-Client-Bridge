import { create } from 'zustand';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: int;
  name: str;
  email: str;
  role: str;
}

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!Cookies.get('access_token'),
  isLoading: false,
  
  login: async (token: string) => {
    Cookies.set('access_token', token, { expires: 1 }); // 1 day
    set({ isAuthenticated: true });
    await useAuthStore.getState().fetchUser();
  },
  
  logout: () => {
    Cookies.remove('access_token');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },
  
  fetchUser: async () => {
    const token = Cookies.get('access_token');
    if (!token) {
        set({ isAuthenticated: false, user: null });
        return;
    }
    
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      Cookies.remove('access_token');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  }
}));
