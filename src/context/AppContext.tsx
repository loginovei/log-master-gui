import { createContext, useContext, useEffect, useState } from 'react';
import { getApplications } from '../api/applications';
import type { Application } from '../types';

interface AppContextValue {
  apps: Application[];
  selectedApp: Application | null;
  setSelectedApp: (app: Application | null) => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  refreshApps: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue>({
  apps: [],
  selectedApp: null,
  setSelectedApp: () => {},
  selectedLang: 'ru',
  setSelectedLang: () => {},
  refreshApps: () => {},
  isDark: false,
  toggleTheme: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedLang, setSelectedLang] = useState('ru');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  function refreshApps() {
    getApplications().then(setApps).catch(() => {});
  }

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }

  useEffect(() => {
    refreshApps();
  }, []);

  return (
    <AppContext.Provider value={{ apps, selectedApp, setSelectedApp, selectedLang, setSelectedLang, refreshApps, isDark, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
