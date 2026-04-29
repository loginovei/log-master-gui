import { createBrowserRouter, RouterProvider } from 'react-router';
import { ConfigProvider, theme } from 'antd';
import { AppProvider, useAppContext } from './context/AppContext';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/Dashboard.page';
import { LogsPage } from './pages/Logs.page';
import { TemplatesPage } from './pages/Templates.page';
import { StatsPage } from './pages/Stats.page';
import { ApplicationsPage } from './pages/Applications.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,           element: <DashboardPage /> },
      { path: 'logs',          element: <LogsPage /> },
      { path: 'templates',     element: <TemplatesPage /> },
      { path: 'stats',         element: <StatsPage /> },
      { path: 'applications',  element: <ApplicationsPage /> },
    ],
  },
]);

function ThemedApp() {
  const { isDark } = useAppContext();
  return (
    <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
}
