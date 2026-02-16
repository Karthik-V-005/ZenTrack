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
  liveMetrics: {
    severity?: string;
    fatigue_score?: number;
    total_active_minutes: number;
    app_switch_count: number;
    tab_switch_count: number;
    context_switch_rate: number;
    longest_continuous_session?: number;
    avg_session_length?: number;
    unique_apps?: number;
    unique_websites?: number;
    late_night_usage_ratio?: number;
    break_count?: number;
    avg_break_length?: number;
  };
  setLiveMetrics: (
    updater: Partial<ZenState['liveMetrics']> | ((prev: ZenState['liveMetrics']) => Partial<ZenState['liveMetrics']>)
  ) => void;
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
  liveMetrics: {
    severity: 'low',
    fatigue_score: 0,
    total_active_minutes: 0,
    app_switch_count: 0,
    tab_switch_count: 0,
    context_switch_rate: 0,
    longest_continuous_session: 0,
    avg_session_length: 0,
    unique_apps: 0,
    unique_websites: 0,
    late_night_usage_ratio: 0,
    break_count: 0,
    avg_break_length: 0,
  },
  setLiveMetrics: (updater) =>
    set((state) => ({
      liveMetrics: {
        ...state.liveMetrics,
        ...(typeof updater === 'function' ? updater(state.liveMetrics) : updater),
      },
    })),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setFatigueScore: (score) => set({ fatigueScore: score }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
