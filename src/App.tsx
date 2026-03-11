import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/Dashboard.page';
import { LogsPage } from './pages/Logs.page';
import { TemplatesPage } from './pages/Templates.page';
import { StatsPage } from './pages/Stats.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,       element: <DashboardPage /> },
      { path: 'logs',      element: <LogsPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'stats',     element: <StatsPage /> },
    ],
  },
]);

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
