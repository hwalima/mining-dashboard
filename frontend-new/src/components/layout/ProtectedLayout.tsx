import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { DateFilterProvider } from '../../contexts/DateFilterContext';
import Layout from './Layout';
import { useAuth } from '../../contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <DateFilterProvider>
          <Layout>
            <Outlet />
          </Layout>
        </DateFilterProvider>
      </DashboardProvider>
    </QueryClientProvider>
  );
};

export default ProtectedLayout;
