import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  useTheme,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  TableView as TableViewIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useDateFilterContext } from '../contexts/DateFilterContext';
import DateFilter from '../components/common/DateFilter';
import Papa from 'papaparse';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Interface for production records using date as primary key
interface GoldProductionRecord {
  date: string;  // Primary key
  total_tonnage_crushed: number;
  total_tonnage_hoisted: number;
  gold_recovery_rate: number;
  operational_efficiency: number;
  gold_smelted: number;
  notes?: string;
}

interface FormData {
  date: string;
  total_tonnage_crushed: string;
  total_tonnage_hoisted: string;
  gold_recovery_rate: string;
  operational_efficiency: string;
  gold_smelted: string;
  notes: string;
}

const INITIAL_FORM_DATA: FormData = {
  date: new Date().toISOString().split('T')[0],
  total_tonnage_crushed: '',
  total_tonnage_hoisted: '',
  gold_recovery_rate: '',
  operational_efficiency: '',
  gold_smelted: '',
  notes: '',
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const Production: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GoldProductionRecord | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectAllFiltered, setSelectAllFiltered] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { dateRange } = useDateFilterContext();

  // Fetch production data
  const { data, isLoading, error } = useQuery({
    queryKey: ['goldProduction'],
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${baseUrl}/api/mining-operations/gold-production`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch production data');
      }
      
      return response.json();
    }
  });

  // Save record mutation
  const saveRecordMutation = useMutation({
    mutationFn: async (record: Partial<GoldProductionRecord>) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if a record with this date already exists (for new records)
      if (!selectedRecord && data?.data) {
        const existingRecord = data.data.find((r: GoldProductionRecord) => r.date === record.date);
        if (existingRecord) {
          throw new Error('A record for this date already exists');
        }
      }

      const response = await fetch(
        `${baseUrl}/api/mining-operations/gold-production${selectedRecord ? `/${encodeURIComponent(selectedRecord.date)}` : ''}`,
        {
          method: selectedRecord ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify(record),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save record');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goldProduction'] });
      setOpenDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  });

  // Delete record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (date: string) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${baseUrl}/api/mining-operations/gold-production/${encodeURIComponent(date)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete record');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goldProduction'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete record:', error);
      alert(error.message || 'Failed to delete record. Please try again.');
    }
  });

  const handleAdd = () => {
    setSelectedRecord(null);
    setFormData(INITIAL_FORM_DATA);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleEdit = (record: GoldProductionRecord) => {
    setSelectedRecord(record);
    setFormData({
      date: record.date,
      total_tonnage_crushed: record.total_tonnage_crushed?.toString() || '',
      total_tonnage_hoisted: record.total_tonnage_hoisted?.toString() || '',
      gold_recovery_rate: record.gold_recovery_rate?.toString() || '',
      operational_efficiency: record.operational_efficiency?.toString() || '',
      gold_smelted: record.gold_smelted?.toString() || '',
      notes: record.notes || '',
    });
    setFormError(null);
    setOpenDialog(true);
  };

  const handleDelete = async (date: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecordMutation.mutateAsync(date);
        alert('Record deleted successfully');
      } catch (error) {
        console.error('Failed to delete record:', error);
      }
    }
  };

  const handleSave = async () => {
    const record: Partial<GoldProductionRecord> = {
      date: formData.date,
      total_tonnage_crushed: parseFloat(formData.total_tonnage_crushed) || 0,
      total_tonnage_hoisted: parseFloat(formData.total_tonnage_hoisted) || 0,
      gold_recovery_rate: parseFloat(formData.gold_recovery_rate) || 0,
      operational_efficiency: parseFloat(formData.operational_efficiency) || 0,
      gold_smelted: parseFloat(formData.gold_smelted) || 0,
      notes: formData.notes,
    };

    await saveRecordMutation.mutateAsync(record);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedRecord(null);
    setFormError(null);
  };

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setFormError(null);
  };

  // Filter and paginate records
  const filteredRecords = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.filter(record => 
      record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.total_tonnage_crushed?.toString().includes(searchTerm) ||
      record.total_tonnage_hoisted?.toString().includes(searchTerm) ||
      record.gold_recovery_rate?.toString().includes(searchTerm) ||
      record.operational_efficiency?.toString().includes(searchTerm) ||
      record.gold_smelted?.toString().includes(searchTerm)
    );
  }, [data?.data, searchTerm]);

  const paginatedRecords = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, page, rowsPerPage]);

  // Table pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Selection handlers
  const handleSelectRecord = (date: string) => {
    setSelectedRecords(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const currentPageDates = paginatedRecords.map(record => record.date);
      setSelectedRecords(prev => Array.from(new Set([...prev, ...currentPageDates])));
    } else {
      const currentPageDates = new Set(paginatedRecords.map(record => record.date));
      setSelectedRecords(prev => prev.filter(date => !currentPageDates.has(date)));
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4">Gold Production Records</Typography>
              <Button
                variant="contained"
                onClick={handleAdd}
                startIcon={<AddIcon />}
              >
                Add Record
              </Button>
            </Box>

            {/* Search and Filter */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateFilter />
              </Grid>
            </Grid>

            {/* Table */}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">
                Failed to load production records. Please try again.
              </Alert>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={
                              paginatedRecords.length > 0 &&
                              paginatedRecords.every(record => 
                                selectedRecords.includes(record.date)
                              )
                            }
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Tonnage Crushed (t)</TableCell>
                        <TableCell align="right">Tonnage Hoisted (t)</TableCell>
                        <TableCell align="right">Recovery Rate (%)</TableCell>
                        <TableCell align="right">Efficiency (%)</TableCell>
                        <TableCell align="right">Gold Smelted (g)</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRecords.map((record) => (
                        <TableRow 
                          key={record.date}
                          hover
                          selected={selectedRecords.includes(record.date)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedRecords.includes(record.date)}
                              onChange={() => handleSelectRecord(record.date)}
                            />
                          </TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right">{record.total_tonnage_crushed.toFixed(2)}</TableCell>
                          <TableCell align="right">{record.total_tonnage_hoisted.toFixed(2)}</TableCell>
                          <TableCell align="right">{record.gold_recovery_rate.toFixed(2)}</TableCell>
                          <TableCell align="right">{record.operational_efficiency.toFixed(2)}</TableCell>
                          <TableCell align="right">{record.gold_smelted.toFixed(2)}</TableCell>
                          <TableCell>{record.notes || '-'}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEdit(record)} size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                onClick={() => handleDelete(record.date)} 
                                size="small" 
                                color="error"
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
                <TablePagination
                  rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                  component="div"
                  count={filteredRecords.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </Paper>
        </Box>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedRecord ? 'Edit Production Record' : 'Add Production Record'}
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange('date')}
                  InputLabelProps={{ shrink: true }}
                  disabled={!!selectedRecord}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tonnage Crushed"
                  type="number"
                  value={formData.total_tonnage_crushed}
                  onChange={handleInputChange('total_tonnage_crushed')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">t</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tonnage Hoisted"
                  type="number"
                  value={formData.total_tonnage_hoisted}
                  onChange={handleInputChange('total_tonnage_hoisted')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">t</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recovery Rate"
                  type="number"
                  value={formData.gold_recovery_rate}
                  onChange={handleInputChange('gold_recovery_rate')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Operational Efficiency"
                  type="number"
                  value={formData.operational_efficiency}
                  onChange={handleInputChange('operational_efficiency')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Gold Smelted"
                  type="number"
                  value={formData.gold_smelted}
                  onChange={handleInputChange('gold_smelted')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSave}
              variant="contained"
              disabled={saveRecordMutation.isPending}
            >
              {saveRecordMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Production;
