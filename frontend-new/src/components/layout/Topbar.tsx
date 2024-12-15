import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useTheme,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Brightness4 } from '@mui/icons-material';
import { Brightness7 } from '@mui/icons-material';
import { Notifications } from '@mui/icons-material';
import { Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const logoLight = new URL('../../assets/icon light background.png', import.meta.url).href;
const logoDark = new URL('../../assets/Icon dark background.png', import.meta.url).href;

interface TopbarProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onThemeToggle }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const currentLogo = theme.palette.mode === 'dark' ? logoDark : logoLight;

  // Update favicon based on theme
  React.useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute('href', currentLogo);
    }
  }, [theme.palette.mode, currentLogo]);

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'background-color 0.3s ease',
        backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#1976d2',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box 
            component="div" 
            onClick={() => navigate('/dashboard')} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
          >
            <img 
              src={currentLogo} 
              alt="Mining Operations Logo" 
              style={{ 
                height: '40px', 
                width: '40px',
                marginRight: '12px',
                transition: 'filter 0.3s ease'
              }} 
            />
            <Typography variant="h6" noWrap component="div">
              Mining Operations Dashboard
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`Switch to ${theme.palette.mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton color="inherit" onClick={onThemeToggle}>
              {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton color="inherit" onClick={handleLogout}>
              <Person />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
