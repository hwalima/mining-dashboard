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
  MenuItem,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { equipmentService } from '../../services/api';

interface ServiceStatus {
  status: 'ok' | 'due_soon' | 'overdue' | 'unknown';
  message: string;
  days_overdue: number | null;
  days_until_next: number | null;
}

interface Equipment {
  id: number;
  name: string;
  description: string;
  department: {
    id: number;
    name: string;
    type: string;
  } | null;
  last_service_date: string | null;
  next_service_date: string | null;
  service_interval_days: number;
  service_status: ServiceStatus;
  days_since_last_service: number | null;
  days_until_next_service: number | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  description: string;
  department_id: number | null;
  last_service_date: string;
  next_service_date: string;
  service_interval_days: number;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
  department_id: null,
  last_service_date: new Date().toISOString().split('T')[0],
  next_service_date: '',
  service_interval_days: 30,
};

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Equipment | 'department_name';
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'name', label: 'Name', numeric: false, sortable: true },
  { id: 'description', label: 'Description', numeric: false, sortable: true },
  { id: 'department_name', label: 'Department', numeric: false, sortable: true },
  { id: 'last_service_date', label: 'Last Service', numeric: false, sortable: true },
  { id: 'next_service_date', label: 'Next Service', numeric: false, sortable: true },
  { id: 'service_interval_days', label: 'Service Interval (Days)', numeric: true, sortable: true },
  { id: 'service_status', label: 'Status', numeric: false, sortable: true },
  { id: 'created_at', label: 'Created At', numeric: false, sortable: true },
  { id: 'updated_at', label: 'Updated At', numeric: false, sortable: true },
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

const getStatusColor = (status: ServiceStatus['status']): any => {
  switch (status) {
    case 'ok':
      return 'success';
    case 'due_soon':
      return 'warning';
    case 'overdue':
      return 'error';
    default:
      return 'default';
  }
};

const EquipmentTable: React.FC = () => {
  const theme = useTheme();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Equipment>('name');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchEquipment();
    fetchDepartments();
  }, []);

  const fetchEquipment = async () => {
    try {
      const data = await equipmentService.getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to fetch equipment');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await equipmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleOpenDialog = (equipment?: Equipment) => {
    if (equipment) {
      setSelectedEquipment(equipment);
      setFormData({
        name: equipment.name,
        description: equipment.description || '',
        department_id: equipment.department?.id || null,
        last_service_date: equipment.last_service_date || new Date().toISOString().split('T')[0],
        next_service_date: equipment.next_service_date || '',
        service_interval_days: equipment.service_interval_days,
      });
    } else {
      setSelectedEquipment(null);
      setFormData(INITIAL_FORM_DATA);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEquipment(null);
    setFormData(INITIAL_FORM_DATA);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedEquipment) {
        await equipmentService.updateEquipment(selectedEquipment.id, formData);
      } else {
        await equipmentService.createEquipment(formData);
      }
      fetchEquipment();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await equipmentService.deleteEquipment(id);
        fetchEquipment();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        setError('Failed to delete equipment');
      }
    }
  };

  const handleRequestSort = (property: keyof Equipment | 'department_name') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleServiceIntervalChange = (value: number) => {
    setFormData(prev => {
      const newData = { ...prev, service_interval_days: value };
      if (prev.last_service_date) {
        const lastService = new Date(prev.last_service_date);
        const nextService = new Date(lastService);
        nextService.setDate(nextService.getDate() + value);
        newData.next_service_date = nextService.toISOString().split('T')[0];
      }
      return newData;
    });
  };

  const handleLastServiceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      last_service_date: value
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Equipment</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Equipment
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
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
            {[...equipment]
              .sort(getComparator(order, orderBy))
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.department?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {item.last_service_date ? (
                      <Box>
                        {format(new Date(item.last_service_date), 'MMM d, yyyy')}
                        {item.days_since_last_service !== null && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            {item.days_since_last_service} days ago
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      'Never'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.next_service_date ? (
                      <Box>
                        {format(new Date(item.next_service_date), 'MMM d, yyyy')}
                        {item.days_until_next_service !== null && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            {item.service_status.message}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      'Not Scheduled'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {item.service_interval_days} days
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.service_status.status === 'ok' ? 'OK' :
                             item.service_status.status === 'due_soon' ? 'Due Soon' :
                             item.service_status.status === 'overdue' ? 'Overdue' : 'Unknown'}
                      color={getStatusColor(item.service_status.status)}
                      sx={{
                        minWidth: '90px',
                        '& .MuiChip-label': {
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{format(new Date(item.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(item.updated_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => handleOpenDialog(item)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(item.id)}
                        sx={{ color: theme.palette.error.main }}
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedEquipment ? 'Edit Equipment' : 'Add Equipment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Department"
              value={formData.department_id || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                department_id: e.target.value ? Number(e.target.value) : null 
              })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Last Service Date"
              type="date"
              value={formData.last_service_date}
              onChange={(e) => handleLastServiceChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Service Interval (Days)"
              type="number"
              value={formData.service_interval_days}
              onChange={(e) => handleServiceIntervalChange(Number(e.target.value))}
              InputProps={{ 
                inputProps: { min: 1 },
                endAdornment: <InputAdornment position="end">days</InputAdornment>
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Next Service Date"
              type="date"
              value={formData.next_service_date}
              onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Auto-calculated but can be manually adjusted"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentTable;
