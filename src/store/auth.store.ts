import { create } from 'zustand';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  isVerified: boolean;
}

interface AuthStore {
  user: IUser | null;
  token: string | null;
  setAuth: (user: IUser | null, token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('velora_token', token);
    } else {
      localStorage.removeItem('velora_token');
    }
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('velora_token');
    set({ user: null, token: null });
  }
}));
