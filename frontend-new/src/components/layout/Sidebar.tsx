import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  Box,
  Typography,
  Collapse,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  Science as ScienceIcon,
  Engineering as MiningIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Construction as ConstructionIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;

interface SubMenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
}

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path?: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { 
    text: 'Production', 
    icon: <MiningIcon />, 
    subItems: [
      { text: 'Overview', icon: <TimelineIcon />, path: '/production' },
      { text: 'Equipment', icon: <BuildIcon />, path: '/equipment' },
      { text: 'Efficiency', icon: <SpeedIcon />, path: '/efficiency' },
    ]
  },
  { 
    text: 'Maintenance', 
    icon: <ConstructionIcon />, 
    subItems: [
      { text: 'Equipment', icon: <BuildIcon />, path: '/equipment' },
      { text: 'Chemicals', icon: <ScienceIcon />, path: '/chemicals' },
    ]
  },
  { text: 'Mining Analytics', icon: <AnalyticsIcon />, path: '/mining-analytics' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Safety', icon: <SecurityIcon />, path: '/safety' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleExpand = (itemText: string) => {
    setExpandedItem(expandedItem === itemText ? null : itemText);
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  const ListItemComponent = motion(ListItem);

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
            : 'linear-gradient(145deg, #f8f9fa, #ffffff)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #fff, #f5f5f5)'
              : 'linear-gradient(45deg, #1976d2, #1565c0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600,
          }}
        >
          MyMine Navigation
        </Typography>
      </Box>

      <List sx={{ pt: 2 }}>
        <AnimatePresence>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItemComponent
                button
                onClick={() => item.path ? handleNavigation(item.path) : handleExpand(item.text)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: (item.path && isCurrentPath(item.path)) || expandedItem === item.text
                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2),
                  },
                  transition: 'all 0.2s',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ListItemIcon
                  sx={{
                    color: (item.path && isCurrentPath(item.path)) || expandedItem === item.text
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: (item.path && isCurrentPath(item.path)) || expandedItem === item.text ? 600 : 400,
                      color: (item.path && isCurrentPath(item.path)) || expandedItem === item.text
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                    },
                  }}
                />
                {item.subItems && (
                  expandedItem === item.text ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemComponent>

              {item.subItems && (
                <Collapse in={expandedItem === item.text} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemComponent
                        key={subItem.text}
                        button
                        onClick={() => handleNavigation(subItem.path)}
                        sx={{
                          pl: 4,
                          mx: 1,
                          borderRadius: 1,
                          mb: 0.5,
                          backgroundColor: isCurrentPath(subItem.path)
                            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2),
                          },
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isCurrentPath(subItem.path)
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                            minWidth: 40,
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.text}
                          sx={{
                            '& .MuiTypography-root': {
                              fontWeight: isCurrentPath(subItem.path) ? 600 : 400,
                              color: isCurrentPath(subItem.path)
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                            },
                          }}
                        />
                      </ListItemComponent>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </List>

      <Divider sx={{ my: 2, opacity: 0.1 }} />

      <List>
        <ListItemComponent
          button
          onClick={() => handleNavigation('/settings')}
          sx={{
            mx: 1,
            borderRadius: 1,
            mb: 0.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemComponent>

        <ListItemComponent
          button
          onClick={() => handleNavigation('/help')}
          sx={{
            mx: 1,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </ListItemComponent>
      </List>
    </Drawer>
  );
};

export default Sidebar;
