import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { DragHandle as DragHandleIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Widget {
  id: string;
  name: string;
  type: string;
  isVisible: boolean;
  description?: string;
}

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
  onSave
}) => {
  const [localWidgets, setLocalWidgets] = useState<Widget[]>(widgets);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const handleToggle = (id: string) => {
    setLocalWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === id ? { ...widget, isVisible: !widget.isVisible } : widget
      )
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(localWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalWidgets(items);
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
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Customize Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Enable/disable widgets and drag to reorder them
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <List 
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ width: '100%' }}
              >
                {localWidgets.map((widget, index) => (
                  <Draggable 
                    key={widget.id} 
                    draggableId={widget.id} 
                    index={index}
                  >
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: 'background.paper'
                        }}
                      >
                        <ListItemIcon {...provided.dragHandleProps}>
                          <DragHandleIcon />
                        </ListItemIcon>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={widget.isVisible}
                            onChange={() => handleToggle(widget.id)}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={widget.name} 
                          secondary={widget.description}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizeDialog;
