import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ZenState {
  user: User | null;
  isAuthenticated: boolean;
  fatigueScore: number;
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setFatigueScore: (score: number) => void;
  logout: () => void;
}

export const useZenStore = create<ZenState>((set) => ({
  user: null,
  isAuthenticated: false,
  fatigueScore: 42,
  isSidebarOpen: true,
  theme: 'dark',
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setFatigueScore: (score) => set({ fatigueScore: score }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
