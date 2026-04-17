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
}

const AppContext = createContext<AppContextValue>({
  apps: [],
  selectedApp: null,
  setSelectedApp: () => {},
  selectedLang: 'ru',
  setSelectedLang: () => {},
  refreshApps: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedLang, setSelectedLang] = useState('ru');

  function refreshApps() {
    getApplications().then(setApps).catch(() => {});
  }

  useEffect(() => {
    refreshApps();
  }, []);

  return (
    <AppContext.Provider value={{ apps, selectedApp, setSelectedApp, selectedLang, setSelectedLang, refreshApps }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
