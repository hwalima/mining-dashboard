import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  IconButton,
  Typography,
  Box,
  useTheme,
  Tooltip,
  Divider
} from '@mui/material';
import { Settings as SettingsIcon, Info as InfoIcon } from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';

interface WidgetCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({ open, onClose }) => {
  const { widgets, toggleWidget } = useDashboard();
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SettingsIcon />
          <Typography variant="h6">Customize Dashboard</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Toggle widgets to show or hide them on your dashboard. Hover over the info icon to see widget details.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {widgets.map((widget) => (
            <ListItem
              key={widget.id}
              sx={{
                borderRadius: 1,
                mb: 1,
                bgcolor: theme.palette.background.paper,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {widget.name}
                    {widget.description && (
                      <Tooltip title={widget.description} arrow>
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={widget.isVisible}
                  onChange={() => toggleWidget(widget.id)}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetCustomizer;
