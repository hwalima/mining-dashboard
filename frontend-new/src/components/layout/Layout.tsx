import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useTheme } from '../../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSidebarOpen = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Topbar 
        onMenuClick={handleSidebarOpen}
        onThemeToggle={toggleTheme}
        isDarkMode={isDarkMode}
      />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: '240px' },
          }}
        >
          <Box sx={{ mt: 8 }}>{children}</Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
