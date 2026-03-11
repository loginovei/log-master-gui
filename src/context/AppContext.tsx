import { createContext, useContext, useEffect, useState } from 'react';
import { getApplications } from '../api/applications';
import type { Application } from '../types';

interface AppContextValue {
  apps: Application[];
  selectedApp: Application | null;
  setSelectedApp: (app: Application | null) => void;
}

const AppContext = createContext<AppContextValue>({
  apps: [],
  selectedApp: null,
  setSelectedApp: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    getApplications().then(setApps).catch(() => {});
  }, []);

  return (
    <AppContext.Provider value={{ apps, selectedApp, setSelectedApp }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
