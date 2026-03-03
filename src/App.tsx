import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/Dashboard.page';
import { LogsPage } from './pages/Logs.page';
import { TemplatesPage } from './pages/Templates.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,       element: <DashboardPage /> },
      { path: 'logs',      element: <LogsPage /> },
      { path: 'templates', element: <TemplatesPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
