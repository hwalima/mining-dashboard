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
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <CssBaseline />
      <Topbar 
        onMenuClick={handleSidebarOpen}
        onThemeToggle={toggleTheme}
        isDarkMode={isDarkMode}
      />
      <Box 
        sx={{ 
          display: 'flex',
          flex: 1,
          width: '100%',
          position: 'relative'
        }}
      >
        <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            marginLeft: { sm: '240px' },
            transition: 'margin-left 0.3s',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ mt: 8, flex: '1 0 auto' }}>
            {children}
          </Box>
        </Box>
      </Box>
      <Box 
        component="div"
        sx={{ 
          width: '100%',
          left: 0,
          right: 0,
          position: 'relative',
          marginLeft: { sm: sidebarOpen ? '240px' : '0' },
          transition: 'margin-left 0.3s'
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
