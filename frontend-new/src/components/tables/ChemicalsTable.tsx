import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { chemicalsService } from '../../services/api';

interface Chemical {
  id: number;
  name: string;
  formula: string;
  concentration: number;
  unit: string;
  quantity: number;
  supplier: string;
}

interface FormData {
  name: string;
  formula: string;
  concentration: number;
  unit: string;
  quantity: number;
  supplier: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  formula: '',
  concentration: 0,
  unit: '',
  quantity: 0,
  supplier: '',
};

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Chemical;
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'name', label: 'Name', numeric: false, sortable: true },
  { id: 'formula', label: 'Formula', numeric: false, sortable: true },
  { id: 'concentration', label: 'Concentration', numeric: true, sortable: true },
  { id: 'unit', label: 'Unit', numeric: false, sortable: true },
  { id: 'quantity', label: 'Quantity', numeric: true, sortable: true },
  { id: 'supplier', label: 'Supplier', numeric: false, sortable: true },
];

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

const ChemicalsTable: React.FC = () => {
  const theme = useTheme();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Chemical>('name');

  useEffect(() => {
    fetchChemicals();
  }, []);

  const fetchChemicals = async () => {
    try {
      const data = await chemicalsService.getChemicals();
      setChemicals(data);
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      setError('Failed to fetch chemicals');
    }
  };

  const handleOpenDialog = (chemical?: Chemical) => {
    if (chemical) {
      setSelectedChemical(chemical);
      setFormData({
        name: chemical.name,
        formula: chemical.formula,
        concentration: chemical.concentration,
        unit: chemical.unit,
        quantity: chemical.quantity,
        supplier: chemical.supplier,
      });
    } else {
      setSelectedChemical(null);
      setFormData(INITIAL_FORM_DATA);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedChemical(null);
    setFormData(INITIAL_FORM_DATA);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedChemical) {
        await chemicalsService.updateChemical(selectedChemical.id, formData);
      } else {
        await chemicalsService.createChemical(formData);
      }
      fetchChemicals();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving chemical:', error);
      setError('Failed to save chemical');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this chemical?')) {
      try {
        await chemicalsService.deleteChemical(id);
        fetchChemicals();
      } catch (error) {
        console.error('Error deleting chemical:', error);
        setError('Failed to delete chemical');
      }
    }
  };

  const handleRequestSort = (property: keyof Chemical) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Mining Chemicals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: '8px',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        >
          Add Chemical
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...chemicals]
              .sort(getComparator(order, orderBy))
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.formula}</TableCell>
                  <TableCell align="right">{item.concentration}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => handleOpenDialog(item)}
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDelete(item.id)}
                        sx={{
                          color: theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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
          }
        }}
      >
        <DialogTitle>
          {selectedChemical ? 'Edit Chemical' : 'Add Chemical'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Formula"
              value={formData.formula}
              onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Concentration"
              value={formData.concentration}
              onChange={(e) => setFormData({ ...formData, concentration: Number(e.target.value) })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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
            }}
          >
            {selectedChemical ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChemicalsTable;
