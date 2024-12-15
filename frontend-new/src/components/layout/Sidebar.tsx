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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  Science as ScienceIcon,
  Engineering as MiningIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Production', icon: <MiningIcon />, path: '/production' },
  { text: 'Equipment', icon: <BuildIcon />, path: '/equipment' },
  { text: 'Chemicals', icon: <ScienceIcon />, path: '/chemicals' },
  { text: 'Mining Analytics', icon: <AnalyticsIcon />, path: '/mining-analytics' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Safety', icon: <SecurityIcon />, path: '/safety' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

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
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar;
