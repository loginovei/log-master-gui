import { createContext, useContext, useEffect, useState } from 'react';
import { getApplications } from '../api/applications';
import type { Application } from '../types';

interface AppContextValue {
  apps: Application[];
  selectedApp: Application | null;
  setSelectedApp: (app: Application | null) => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  availableLangs: string[];
  setAvailableLangs: (langs: string[]) => void;
}

const AppContext = createContext<AppContextValue>({
  apps: [],
  selectedApp: null,
  setSelectedApp: () => {},
  selectedLang: 'ru',
  setSelectedLang: () => {},
  availableLangs: ['ru', 'en'],
  setAvailableLangs: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedLang, setSelectedLang] = useState('ru');
  const [availableLangs, setAvailableLangs] = useState<string[]>(['ru', 'en']);

  useEffect(() => {
    getApplications().then(setApps).catch(() => {});
  }, []);

  return (
    <AppContext.Provider value={{
      apps, selectedApp, setSelectedApp,
      selectedLang, setSelectedLang,
      availableLangs, setAvailableLangs,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
