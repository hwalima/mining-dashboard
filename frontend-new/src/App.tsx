import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { DateFilterProvider } from './contexts/DateFilterContext';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machinery from './pages/Machinery';
import Profile from './pages/Profile';
import Equipment from './pages/Equipment';
import Production from './pages/Production';
import Chemicals from './pages/Chemicals';
import Reports from './pages/Reports';
import Safety from './pages/Safety';
import MiningAnalytics from './pages/MiningAnalytics';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Root layout with providers
const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <DashboardProvider>
          <DateFilterProvider>
            <Outlet />
          </DateFilterProvider>
        </DashboardProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Router configuration with future flags
const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        {
          path: '/',
          element: <Dashboard />,
        },
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/dashboard',
          element: <Dashboard />,
        },
        {
          path: '/machinery',
          element: <Machinery />,
        },
        {
          path: '/production',
          element: <Production />,
        },
        {
          path: '/chemicals',
          element: <Chemicals />,
        },
        {
          path: '/reports',
          element: <Reports />,
        },
        {
          path: '/safety',
          element: <Safety />,
        },
        {
          path: '/profile',
          element: <Profile />,
        },
        {
          path: '/equipment',
          element: <Equipment />,
        },
        {
          path: '/mining-analytics',
          element: <MiningAnalytics />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

// App component
const App = () => <RouterProvider router={router} />;

export default App;
