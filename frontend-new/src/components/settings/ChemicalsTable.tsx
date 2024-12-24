import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { Chemical, ChemicalFormData } from '../../types/chemical';
import { chemicalService } from '../../services/api';

const ChemicalsTable: React.FC = () => {
  const theme = useTheme();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const [formData, setFormData] = useState<ChemicalFormData>({
    name: '',
    unit: '',
    current_stock: 0,
    minimum_required: 0,
    unit_price: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChemicals();
  }, []);

  const fetchChemicals = async () => {
    try {
      const data = await chemicalService.getChemicals();
      setChemicals(data);
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      setError('Failed to fetch chemicals');
    }
  };

  const handleOpenDialog = (chemical?: Chemical) => {
    if (chemical) {
      setEditingChemical(chemical);
      setFormData({
        name: chemical.name,
        unit: chemical.unit,
        current_stock: chemical.current_stock,
        minimum_required: chemical.minimum_required,
        unit_price: chemical.unit_price,
      });
    } else {
      setEditingChemical(null);
      setFormData({
        name: '',
        unit: '',
        current_stock: 0,
        minimum_required: 0,
        unit_price: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingChemical(null);
    setFormData({
      name: '',
      unit: '',
      current_stock: 0,
      minimum_required: 0,
      unit_price: 0,
    });
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingChemical) {
        await chemicalService.updateChemical(editingChemical.id, formData);
      } else {
        await chemicalService.createChemical(formData);
      }
      handleCloseDialog();
      fetchChemicals();
    } catch (error) {
      console.error('Error saving chemical:', error);
      setError('Failed to save chemical');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this chemical?')) {
      try {
        await chemicalService.deleteChemical(id);
        fetchChemicals();
      } catch (error) {
        console.error('Error deleting chemical:', error);
        setError('Failed to delete chemical');
      }
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScienceIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6">Chemicals Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              ml: 'auto',
              borderRadius: '8px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
            }}
          >
            Add Chemical
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Minimum Required</TableCell>
                <TableCell>Unit Price ($)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chemicals.map((chemical) => (
                <TableRow key={chemical.id}>
                  <TableCell>{chemical.name}</TableCell>
                  <TableCell>{chemical.unit}</TableCell>
                  <TableCell>{chemical.current_stock}</TableCell>
                  <TableCell>{chemical.minimum_required}</TableCell>
                  <TableCell>${typeof chemical.unit_price === 'number' ? chemical.unit_price.toFixed(2) : Number(chemical.unit_price).toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(chemical)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(chemical.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
            },
          }}
        >
          <DialogTitle>
            {editingChemical ? 'Edit Chemical' : 'Add Chemical'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                placeholder="e.g., kg, L, m³"
              />
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) })}
                required
              />
              <TextField
                fullWidth
                label="Minimum Required"
                type="number"
                value={formData.minimum_required}
                onChange={(e) => setFormData({ ...formData, minimum_required: parseFloat(e.target.value) })}
                required
              />
              <TextField
                fullWidth
                label="Unit Price ($)"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                borderRadius: '8px',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              {editingChemical ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ChemicalsTable;
