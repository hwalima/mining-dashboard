import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Box,
  Typography,
  Switch,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Info as InfoIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Widget } from '../../types/dashboard';

interface CustomizeDialogProps {
  open: boolean;
  onClose: () => void;
  widgets: Widget[];
  onSave: (widgets: Widget[]) => void;
}

const CustomizeDialog: React.FC<CustomizeDialogProps> = ({
  open,
  onClose,
  widgets = [],
  onSave,
}) => {
  const theme = useTheme();
  const [localWidgets, setLocalWidgets] = useState<Widget[]>(widgets);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const handleToggle = (id: string) => {
    setLocalWidgets((prevWidgets) =>
      prevWidgets.map((widget) =>
        widget.id === id ? { ...widget, isVisible: !widget.isVisible } : widget
      )
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLocalWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        return newItems;
      });
    }
  };

  const handleSave = () => {
    onSave(localWidgets);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
            : 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <SettingsIcon
            sx={{
              color: theme.palette.primary.main,
              fontSize: '1.5rem',
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Customize Dashboard
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            ml: '32px',
            opacity: 0.8,
          }}
        >
          Enable/disable widgets and drag to reorder them
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <List sx={{ width: '100%', p: 0 }}>
          <AnimatePresence>
            {localWidgets.map((widget, index) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
              >
                <ListItem
                  sx={{
                    mb: 1,
                    borderRadius: '12px',
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(
                      theme.palette.divider,
                      theme.palette.mode === 'dark' ? 0.2 : 0.1
                    )}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(
                        theme.palette.common.black,
                        0.08
                      )}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mr: 2,
                      cursor: 'grab',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <DragIcon />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{widget.name}</Typography>
                      {widget.description && (
                        <Tooltip title={widget.description} arrow>
                          <InfoIcon
                            sx={{
                              fontSize: '1rem',
                              color: theme.palette.text.secondary,
                              opacity: 0.7,
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Switch
                    checked={widget.isVisible}
                    onChange={() => handleToggle(widget.id)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.5),
                      },
                    }}
                  />
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<CheckIcon />}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.6)}`,
            },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizeDialog;
