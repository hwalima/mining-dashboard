import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet,
  createRoutesFromElements
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { DateFilterProvider } from './contexts/DateFilterContext';
import { CompanySettingsProvider } from './contexts/CompanySettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DynamicFavicon from './components/DynamicFavicon';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Safety from './pages/Safety';
import Energy from './pages/Energy';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import MiningAnalytics from './pages/MiningAnalytics';
import ChemicalsManagement from './pages/ChemicalsManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedLayout = () => {
  return (
    <ThemeProvider>
      <CompanySettingsProvider>
        <DashboardProvider>
          <DateFilterProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Outlet />
            </LocalizationProvider>
          </DateFilterProvider>
        </DashboardProvider>
      </CompanySettingsProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <CompanySettingsProvider>
            <DynamicFavicon />
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="production" element={<Production />} />
                  <Route path="safety" element={<Safety />} />
                  <Route path="energy" element={<Energy />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="analytics" element={<MiningAnalytics />} />
                  <Route path="chemicals" element={<ChemicalsManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Router>
          </CompanySettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
