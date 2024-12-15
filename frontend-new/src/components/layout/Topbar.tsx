import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useTheme,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { 
  Brightness4,
  Brightness7,
  Notifications,
  Person,
  Settings,
  Logout,
  AccountCircle,
  NotificationsActive,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const logoLight = new URL('../../assets/icon light background.png', import.meta.url).href;
const logoDark = new URL('../../assets/Icon dark background.png', import.meta.url).href;

interface TopbarProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onThemeToggle }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const currentLogo = theme.palette.mode === 'dark' ? logoDark : logoLight;

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    navigate('/login');
  };

  const notifications = [
    { id: 1, message: "Equipment maintenance due", type: "warning" },
    { id: 2, message: "Production target achieved", type: "success" },
    { id: 3, message: "New safety protocol update", type: "info" },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
          : 'linear-gradient(145deg, #1976d2, #1565c0)',
        backdropFilter: 'blur(10px)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(25, 118, 210, 0.3)',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{
              mr: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s',
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={currentLogo}
              alt="Logo"
              style={{
                height: '32px',
                marginRight: '12px',
                filter: theme.palette.mode === 'dark' ? 'brightness(1)' : 'brightness(1)',
              }}
            />
            <Typography variant="h6" noWrap component="div">
              Mining Operations Dashboard
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <IconButton color="inherit" onClick={onThemeToggle}>
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            edge="end"
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.dark }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
                : 'linear-gradient(145deg, #fff, #f5f5f5)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
              minWidth: 200,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
                : 'linear-gradient(145deg, #fff, #f5f5f5)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
              minWidth: 280,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={handleMenuClose}>
              <ListItemIcon>
                <NotificationsActive
                  sx={{
                    color:
                      notification.type === 'warning'
                        ? 'warning.main'
                        : notification.type === 'success'
                        ? 'success.main'
                        : 'info.main',
                  }}
                />
              </ListItemIcon>
              <Typography variant="body2">{notification.message}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
