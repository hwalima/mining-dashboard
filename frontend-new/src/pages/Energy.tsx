import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  Button,
  TextField,
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
  TablePagination,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import Layout from '../components/layout/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { energyUsageService } from '../services/api';
import { format, subDays } from 'date-fns';
import { useDateFilterContext } from '../contexts/DateFilterContext';
import { useCompanySettings } from '../contexts/CompanySettingsContext';
import DateFilter from '../components/common/DateFilter';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import logo from '../assets/icon light background.png';

interface EnergyUsageRecord {
  id: number;
  date: string;
  electricity_kwh: number;
  electricity_cost: number;
  diesel_liters: number;
  diesel_cost: number;
  total_cost: number;
  notes?: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DeleteDialogState {
  open: boolean;
  record: EnergyUsageRecord | null;
}

const INITIAL_FORM_DATA = {
  date: new Date().toISOString().split('T')[0],
  electricity_kwh: 0,
  electricity_cost: 0,
  diesel_liters: 0,
  diesel_cost: 0,
  total_cost: 0,
  notes: ''
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const Energy: React.FC = () => {
  const theme = useTheme();
  const { settings: companySettings } = useCompanySettings();
  const queryClient = useQueryClient();
  const { dateRange } = useDateFilterContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EnergyUsageRecord | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectAllFiltered, setSelectAllFiltered] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ open: false, record: null });

  // Fetch energy usage data
  const { data, isLoading, error } = useQuery({
    queryKey: ['energyUsage', dateRange],
    queryFn: async () => {
      return await energyUsageService.getEnergyUsage({
        from_date: format(dateRange.startDate || subDays(new Date(), 30), 'yyyy-MM-dd'),
        to_date: format(dateRange.endDate || new Date(), 'yyyy-MM-dd')
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: energyUsageService.deleteEnergyUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energyUsage'] });
      setFormError(null);
    },
    onError: (error: any) => {
      console.error('Error deleting record:', error);
      setFormError(error.message || 'Failed to delete record. Please try again.');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Update mutation received data:', data);
      return energyUsageService.updateEnergyUsage(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energyUsage'] });
      setOpenDialog(false);
      setSelectedRecord(null);
      setFormData(INITIAL_FORM_DATA);
      setFormError(null);
    },
    onError: (error: any) => {
      console.error('Error updating record:', error);
      setFormError(error.message || 'Failed to update record. Please try again.');
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: energyUsageService.createEnergyUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energyUsage'] });
      setOpenDialog(false);
      setFormData(INITIAL_FORM_DATA);
      setFormError(null);
    },
    onError: (error: any) => {
      console.error('Error creating record:', error);
      setFormError(error.message || 'Failed to create record. Please try again.');
    }
  });

  const handleOpenDialog = (record?: EnergyUsageRecord) => {
    if (record) {
      console.log('Opening dialog with record:', record);
      setSelectedRecord(record);
      setFormData({
        id: record.id,
        date: record.date,
        electricity_kwh: record.electricity_kwh,
        electricity_cost: record.electricity_cost,
        diesel_liters: record.diesel_liters,
        diesel_cost: record.diesel_cost,
        total_cost: record.total_cost,
        notes: record.notes || ''
      });
    } else {
      setSelectedRecord(null);
      setFormData(INITIAL_FORM_DATA);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
    setFormData(INITIAL_FORM_DATA);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      // Calculate total cost
      const newDieselCost = Number(formData.diesel_cost);
      const electricityCost = Number(formData.electricity_cost);
      const calculatedTotalCost = newDieselCost + electricityCost;

      const processedData = {
        ...formData,
        electricity_kwh: Number(formData.electricity_kwh),
        electricity_cost: electricityCost,
        diesel_liters: Number(formData.diesel_liters),
        diesel_cost: newDieselCost,
        total_cost: calculatedTotalCost
      };

      if (selectedRecord) {
        console.log('Updating existing record:', selectedRecord.id);
        await updateMutation.mutateAsync({
          ...processedData,
          id: selectedRecord.id
        });
      } else {
        console.log('Creating new record');
        await createMutation.mutateAsync(processedData);
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit form. Please try again.';
      setFormError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      setFormError('Invalid record ID');
      return;
    }

    try {
      console.log('Deleting record with ID:', id);
      await deleteMutation.mutateAsync(id);
      setDeleteDialog({ open: false, record: null });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      setFormError(error.message || 'Failed to delete record. Please try again.');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportCSV = () => {
    if (!data?.data) return;

    const csvData = data.data.map(record => ({
      Date: new Date(record.date).toLocaleDateString(),
      'Electricity (kWh)': record.electricity_kwh.toFixed(2),
      'Electricity Cost ($)': record.electricity_cost.toFixed(2),
      'Diesel (L)': record.diesel_liters.toFixed(2),
      'Diesel Cost ($)': record.diesel_cost.toFixed(2),
      'Total Cost ($)': record.total_cost.toFixed(2),
      Notes: record.notes || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `energy_usage_records_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleExportClose();
  };

  const handleExportPDF = () => {
    if (!data?.data) return;

    console.log('Company Settings:', companySettings); // Debug log

    const doc = new jsPDF();
    
    // Add company logo and information
    if (companySettings) {
      console.log('Adding company information to PDF');
      
      // Add default logo if no custom logo is set
      const logoToUse = theme.palette.mode === 'dark' ? companySettings.darkLogo : companySettings.lightLogo;
      
      try {
        if (logoToUse) {
          // For base64 images from settings
          const base64Logo = logoToUse.split(',')[1] || logoToUse;
          doc.addImage(base64Logo, 'PNG', 14, 10, 30, 30);
        } else {
          // Use default logo
          doc.addImage(logo, 'PNG', 14, 10, 30, 30);
        }
        console.log('Logo added successfully');
      } catch (error) {
        console.error('Failed to add logo to PDF:', error);
        // Fallback: try to add default logo if custom logo fails
        try {
          doc.addImage(logo, 'PNG', 14, 10, 30, 30);
        } catch (e) {
          console.error('Failed to add default logo:', e);
        }
      }
      
      // Add company information in gold color
      doc.setTextColor(255, 191, 0); // Brighter gold color for better visibility
      doc.setFontSize(24);
      const companyName = companySettings.name || 'Hwalima Digital';
      console.log('Adding company name:', companyName);
      doc.text(companyName, 50, 25);
      
      doc.setFontSize(14);
      const tagline = companySettings.tagline || 'Excellence in Gold Production';
      doc.text(tagline, 50, 35);
      
      doc.setFontSize(12);
      const email = companySettings.email || 'info@hwalima.digital';
      const phone = companySettings.phone || '0785425978';
      doc.text(`Contact: ${email}`, 50, 43);
      doc.text(`Phone: ${phone}`, 50, 51);
      
      const address = companySettings.address || '66 Donovan Street';
      doc.text(`Address: ${address}`, 50, 59);
    } else {
      // If no company settings, use default branding
      try {
        doc.addImage(logo, 'PNG', 14, 10, 30, 30);
      } catch (error) {
        console.error('Failed to add default logo:', error);
      }
      
      doc.setTextColor(255, 191, 0);
      doc.setFontSize(24);
      doc.text('Hwalima Digital', 50, 25);
      
      doc.setFontSize(14);
      doc.text('Excellence in Gold Production', 50, 35);
      
      doc.setFontSize(12);
      doc.text('Contact: info@hwalima.digital', 50, 43);
      doc.text('Phone: 0785425978', 50, 51);
      doc.text('Address: 66 Donovan Street', 50, 59);
    }
    
    // Add report title and date range
    doc.setTextColor(0, 0, 0); // Reset to black color
    doc.setFontSize(18);
    doc.text('Energy Usage Report', 14, companySettings ? 75 : 20);
    
    doc.setFontSize(12);
    doc.text(
      `Report Period: ${format(dateRange.startDate || subDays(new Date(), 30), 'dd/MM/yyyy')} - ${format(dateRange.endDate || new Date(), 'dd/MM/yyyy')}`,
      14,
      companySettings ? 83 : 30
    );
    
    // Table configuration
    const tableColumn = [
      'Date',
      'Electricity (kWh)',
      'Electricity Cost ($)',
      'Diesel (L)',
      'Diesel Cost ($)',
      'Total Cost ($)',
      'Notes'
    ];
    
    const tableRows = data.data.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.electricity_kwh.toFixed(2),
      record.electricity_cost.toFixed(2),
      record.diesel_liters.toFixed(2),
      record.diesel_cost.toFixed(2),
      record.total_cost.toFixed(2),
      record.notes || ''
    ]);

    // Create table with styling
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: companySettings ? 90 : 40,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [255, 191, 0], // Matching gold color
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 25 }, // Electricity kWh
        2: { cellWidth: 25 }, // Electricity Cost
        3: { cellWidth: 25 }, // Diesel L
        4: { cellWidth: 25 }, // Diesel Cost
        5: { cellWidth: 25 }, // Total Cost
        6: { cellWidth: 'auto' } // Notes
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });

    // Add footer with page numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`energy_usage_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Sort function
  const sortData = (data: EnergyUsageRecord[]) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date comparison
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }

      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Request handler for sorting
  const handleRequestSort = (property: string) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'asc';
    setSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc',
    });
  };

  // Get sort direction icon
  const getSortDirectionIcon = (property: string) => {
    if (sortConfig.key !== property) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    );
  };

  useEffect(() => {
    console.log('Company Settings loaded:', companySettings);
  }, [companySettings]);

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Typography color="error">Error loading energy usage data</Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" gutterBottom>
                Energy Management
              </Typography>
            </Grid>
            <Grid item>
              <DateFilter />
            </Grid>
          </Grid>
        </Box>

        <Paper sx={{ mt: 4, p: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Record
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
            >
              Export
            </Button>
          </Box>

          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={() => setExportAnchorEl(null)}
          >
            <MenuItem onClick={() => {
              handleExportCSV();
              setExportAnchorEl(null);
            }}>
              <ListItemIcon>
                <TableViewIcon fontSize="small" />
              </ListItemIcon>
              Export as CSV
            </MenuItem>
            <MenuItem onClick={() => {
              handleExportPDF();
              setExportAnchorEl(null);
            }}>
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              Export as PDF
            </MenuItem>
          </Menu>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    onClick={() => handleRequestSort('date')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Date {getSortDirectionIcon('date')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('electricity_kwh')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Electricity (kWh) {getSortDirectionIcon('electricity_kwh')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('electricity_cost')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Electricity Cost ($) {getSortDirectionIcon('electricity_cost')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('diesel_liters')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Diesel (L) {getSortDirectionIcon('diesel_liters')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('diesel_cost')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Diesel Cost ($) {getSortDirectionIcon('diesel_cost')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('total_cost')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Total Cost ($) {getSortDirectionIcon('total_cost')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('notes')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Notes {getSortDirectionIcon('notes')}
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortData(data?.data || [])
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record: EnergyUsageRecord) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell align="right">{record.electricity_kwh.toFixed(2)}</TableCell>
                      <TableCell align="right">${record.electricity_cost.toFixed(2)}</TableCell>
                      <TableCell align="right">{record.diesel_liters.toFixed(2)}</TableCell>
                      <TableCell align="right">${record.diesel_cost.toFixed(2)}</TableCell>
                      <TableCell align="right">${record.total_cost.toFixed(2)}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(record)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDialog({ open: true, record })}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            component="div"
            count={data?.data.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {selectedRecord ? 'Edit Energy Usage Record' : 'Add Energy Usage Record'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                {formError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                  </Alert>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Electricity (kWh)"
                      value={formData.electricity_kwh}
                      onChange={(e) =>
                        setFormData({ ...formData, electricity_kwh: Number(e.target.value) })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Electricity Cost"
                      value={formData.electricity_cost}
                      onChange={(e) =>
                        setFormData({ ...formData, electricity_cost: Number(e.target.value) })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Diesel (L)"
                      value={formData.diesel_liters}
                      onChange={(e) =>
                        setFormData({ ...formData, diesel_liters: Number(e.target.value) })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Diesel Cost"
                      value={formData.diesel_cost}
                      onChange={(e) =>
                        setFormData({ ...formData, diesel_cost: Number(e.target.value) })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {selectedRecord ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, record: null })}>
          <DialogTitle>Delete Energy Usage Record</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this record?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, record: null })}>Cancel</Button>
            <Button
              onClick={() => handleDelete(deleteDialog.record?.id || 0)}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Energy;
