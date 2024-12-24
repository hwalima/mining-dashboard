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
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  TableView as TableViewIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useDateFilterContext } from '../contexts/DateFilterContext';
import { useCompanySettings } from '../contexts/CompanySettingsContext';
import DateFilter from '../components/common/DateFilter';
import Papa from 'papaparse';
import { format, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { goldProductionService } from '../services/api';
import logo from '../assets/icon light background.png';  

// Interface for production records using date as primary key
interface GoldProductionRecord {
  date: string;  // Primary key
  total_tonnage_crushed: number;
  total_tonnage_hoisted: number;
  total_tonnage_milled: number;
  gold_recovery_rate: number;
  operational_efficiency: number;
  smelted_gold: number;
  gold_price: number;
  notes?: string;
}

interface FormData {
  date: string;
  total_tonnage_crushed: string;
  total_tonnage_hoisted: string;
  total_tonnage_milled: string;
  gold_recovery_rate: string;
  operational_efficiency: string;
  smelted_gold: string;
  gold_price: string;
  notes: string;
}

interface DeleteDialogState {
  open: boolean;
  record: GoldProductionRecord | null;
}

const INITIAL_FORM_DATA: FormData = {
  date: new Date().toISOString().split('T')[0],
  total_tonnage_crushed: '',
  total_tonnage_hoisted: '',
  total_tonnage_milled: '',
  gold_recovery_rate: '',
  operational_efficiency: '',
  smelted_gold: '',
  gold_price: '',
  notes: '',
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const Production: React.FC = () => {
  const theme = useTheme();
  const { settings: companySettings } = useCompanySettings();
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
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ open: false, record: null });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  const queryClient = useQueryClient();
  const { dateRange } = useDateFilterContext();

  // Fetch production data
  const { data, isLoading, error } = useQuery({
    queryKey: ['goldProduction', dateRange],
    queryFn: async () => {
      return await goldProductionService.getGoldProduction({
        from_date: format(dateRange.startDate || subDays(new Date(), 30), 'yyyy-MM-dd'),
        to_date: format(dateRange.endDate || new Date(), 'yyyy-MM-dd')
      });
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => goldProductionService.createRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goldProduction'] });
      setOpenDialog(false);
      setFormData(INITIAL_FORM_DATA);
      setFormError(null);
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.error || 'Failed to create record');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: FormData) => goldProductionService.updateRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goldProduction'] });
      setOpenDialog(false);
      setSelectedRecord(null);
      setFormData(INITIAL_FORM_DATA);
      setFormError(null);
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.error || 'Failed to update record');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (date: string) => goldProductionService.deleteRecord(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goldProduction'] });
      setSelectedRecord(null);
    },
    onError: (error: any) => {
      console.error('Error deleting record:', error);
    }
  });

  // Sort function
  const sortData = (data: GoldProductionRecord[]) => {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    try {
      // Validate form data
      const numericFields = ['total_tonnage_crushed', 'total_tonnage_hoisted', 'total_tonnage_milled', 'gold_recovery_rate', 'operational_efficiency', 'smelted_gold', 'gold_price'];
      const formDataToSubmit = {
        date: formData.date,
        total_tonnage_crushed: parseFloat(formData.total_tonnage_crushed),
        total_tonnage_hoisted: parseFloat(formData.total_tonnage_hoisted),
        total_tonnage_milled: parseFloat(formData.total_tonnage_milled),
        gold_recovery_rate: parseFloat(formData.gold_recovery_rate),
        operational_efficiency: parseFloat(formData.operational_efficiency),
        smelted_gold: parseFloat(formData.smelted_gold),
        gold_price: parseFloat(formData.gold_price),
        notes: formData.notes
      };

      // Check for invalid numbers
      for (const field of numericFields) {
        if (isNaN(formDataToSubmit[field])) {
          setFormError(`Invalid number for ${field.replace(/_/g, ' ')}`);
          return;
        }
      }

      if (selectedRecord) {
        await updateMutation.mutateAsync(formDataToSubmit);
      } else {
        await createMutation.mutateAsync(formDataToSubmit);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleDelete = async (date: string) => {
    try {
      await deleteMutation.mutateAsync(date);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (record: GoldProductionRecord) => {
    setSelectedRecord(record);
    setFormData({
      date: record.date,
      total_tonnage_crushed: record.total_tonnage_crushed?.toString() || '0',
      total_tonnage_hoisted: record.total_tonnage_hoisted?.toString() || '0',
      total_tonnage_milled: record.total_tonnage_milled?.toString() || '0',
      gold_recovery_rate: record.gold_recovery_rate?.toString() || '0',
      operational_efficiency: record.operational_efficiency?.toString() || '0',
      smelted_gold: record.smelted_gold?.toString() || '0',
      gold_price: record.gold_price?.toString() || '0',
      notes: record.notes || ''
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setSelectedRecord(null);
    setFormData(INITIAL_FORM_DATA);
    setFormError(null);
    setOpenDialog(true);
  };

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

  const handleExportCSV = () => {
    if (!data?.data) return;

    const csvData = data.data.map(record => ({
      Date: new Date(record.date).toLocaleDateString(),
      'Tonnage Crushed (t)': record.total_tonnage_crushed.toFixed(2),
      'Tonnage Hoisted (t)': record.total_tonnage_hoisted.toFixed(2),
      'Tonnage Milled (t)': record.total_tonnage_milled.toFixed(2),
      'Recovery Rate (%)': record.gold_recovery_rate.toFixed(2),
      'Efficiency (%)': record.operational_efficiency.toFixed(2),
      'Smelted Gold (g)': record.smelted_gold.toFixed(2),
      'Gold Price ($)': record.gold_price.toFixed(2),
      Notes: record.notes || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `production_records_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!data?.data) return;

    const doc = new jsPDF();
    
    // Add company logo based on theme
    if (companySettings) {
      const logoToUse = theme.palette.mode === 'dark' ? companySettings.darkLogo : companySettings.lightLogo;
      if (logoToUse) {
        const logoWidth = 40;
        const logoHeight = 40;
        doc.addImage(logoToUse, 'PNG', 14, 10, logoWidth, logoHeight);
      }
      
      // Add company information with gold color
      doc.setTextColor(218, 165, 32); // Gold color
      doc.setFontSize(20);
      doc.text(companySettings.name || 'Mining Company Ltd.', 60, 25);
      doc.setFontSize(12);
      doc.text(companySettings.tagline || 'Excellence in Gold Production', 60, 35);
      doc.text(`Contact: ${companySettings.email || 'info@miningcompany.com'}`, 60, 45);
      
      if (companySettings.phone || companySettings.website) {
        doc.text([
          companySettings.phone && `Phone: ${companySettings.phone}`,
          companySettings.website && `Website: ${companySettings.website}`,
        ].filter(Boolean).join(' | '), 60, 55);
      }
      
      if (companySettings.address) {
        doc.text(`Address: ${companySettings.address}`, 60, 65);
      }
    }
    
    // Add report title
    doc.setTextColor(0, 0, 0); // Reset to black color
    doc.setFontSize(16);
    doc.text('Gold Production Records', 14, companySettings ? 80 : 20);
    
    // Add date range
    doc.setFontSize(10);
    doc.text(
      `Report Period: ${format(dateRange.startDate || subDays(new Date(), 30), 'dd/MM/yyyy')} - ${format(dateRange.endDate || new Date(), 'dd/MM/yyyy')}`,
      14,
      companySettings ? 90 : 30
    );
    
    const tableColumn = [
      'Date', 
      'Tonnage Crushed (t)', 
      'Tonnage Hoisted (t)',
      'Tonnage Milled (t)',
      'Recovery Rate (%)',
      'Efficiency (%)',
      'Smelted Gold (g)',
      'Gold Price ($)',
      'Notes'
    ];
    
    const tableRows = data.data.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.total_tonnage_crushed.toFixed(2),
      record.total_tonnage_hoisted.toFixed(2),
      record.total_tonnage_milled.toFixed(2),
      record.gold_recovery_rate.toFixed(2),
      record.operational_efficiency.toFixed(2),
      record.smelted_gold.toFixed(2),
      record.gold_price.toFixed(2),
      record.notes || ''
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: companySettings ? 100 : 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 1,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [218, 165, 32], // Gold color for header
        textColor: [0, 0, 0], // Black text for better contrast
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 'auto' }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250] // Light background for alternate rows
      }
    });

    // Add footer
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

    doc.save(`gold_production_records_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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
      record.total_tonnage_milled?.toString().includes(searchTerm) ||
      record.gold_recovery_rate?.toString().includes(searchTerm) ||
      record.operational_efficiency?.toString().includes(searchTerm) ||
      record.smelted_gold?.toString().includes(searchTerm) ||
      record.gold_price?.toString().includes(searchTerm)
    );
  }, [data?.data, searchTerm]);

  const paginatedRecords = useMemo(() => {
    const start = page * rowsPerPage;
    return sortData(filteredRecords).slice(start, start + rowsPerPage);
  }, [filteredRecords, page, rowsPerPage, sortConfig]);

  // Table pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Gold Production Records
          </Typography>
          
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(40,40,40,0.9) 0%, rgba(20,20,20,0.8) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <DateFilter />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedRecord(null);
                    setFormData(INITIAL_FORM_DATA);
                    setOpenDialog(true);
                  }}
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    color: 'white',
                    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    }
                  }}
                >
                  Add Record
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={(e) => setExportAnchorEl(e.currentTarget)}
                  sx={{
                    borderColor: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error instanceof Error ? error.message : 'Failed to load data'}
            </Alert>
          )}

          <TableContainer 
            component={Paper}
            sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(40,40,40,0.9) 0%, rgba(20,20,20,0.8) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectAllFiltered}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectAllFiltered(checked);
                        setSelectedRecords(
                          checked ? filteredRecords.map((record) => record.date) : []
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('date')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Date {getSortDirectionIcon('date')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('total_tonnage_crushed')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Tonnage Crushed (t) {getSortDirectionIcon('total_tonnage_crushed')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('total_tonnage_hoisted')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Tonnage Hoisted (t) {getSortDirectionIcon('total_tonnage_hoisted')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('total_tonnage_milled')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Tonnage Milled (t) {getSortDirectionIcon('total_tonnage_milled')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('gold_recovery_rate')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Recovery Rate (%) {getSortDirectionIcon('gold_recovery_rate')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('operational_efficiency')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Efficiency (%) {getSortDirectionIcon('operational_efficiency')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('smelted_gold')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Smelted Gold (g) {getSortDirectionIcon('smelted_gold')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRequestSort('gold_price')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Gold Price ($) {getSortDirectionIcon('gold_price')}
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((record, index) => (
                    <TableRow
                      key={record.date}
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRecords.includes(record.date)}
                          onChange={(e) => handleSelectRecord(record.date)}
                        />
                      </TableCell>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.total_tonnage_crushed?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{record.total_tonnage_hoisted?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{record.total_tonnage_milled?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{record.gold_recovery_rate?.toFixed(2) || '0.00'}%</TableCell>
                      <TableCell>{record.operational_efficiency?.toFixed(2) || '0.00'}%</TableCell>
                      <TableCell>{record.smelted_gold?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${record.gold_price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(record)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteDialog({ open: true, record })}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Box>

        {/* Record Form Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(40,40,40,0.95) 0%, rgba(20,20,20,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '12px',
            }
          }}
        >
          <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
            {selectedRecord ? 'Edit Production Record' : 'Add Production Record'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ mt: 2 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tonnage Crushed"
                    type="number"
                    name="total_tonnage_crushed"
                    value={formData.total_tonnage_crushed}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_tonnage_crushed: e.target.value }))}
                    required
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tonnage Hoisted"
                    type="number"
                    name="total_tonnage_hoisted"
                    value={formData.total_tonnage_hoisted}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_tonnage_hoisted: e.target.value }))}
                    required
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tonnage Milled"
                    type="number"
                    name="total_tonnage_milled"
                    value={formData.total_tonnage_milled}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_tonnage_milled: e.target.value }))}
                    required
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Recovery Rate (%)"
                    type="number"
                    name="gold_recovery_rate"
                    value={formData.gold_recovery_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, gold_recovery_rate: e.target.value }))}
                    required
                    inputProps={{ step: "0.01", min: "0", max: "100" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Operational Efficiency (%)"
                    type="number"
                    name="operational_efficiency"
                    value={formData.operational_efficiency}
                    onChange={(e) => setFormData(prev => ({ ...prev, operational_efficiency: e.target.value }))}
                    required
                    inputProps={{ step: "0.01", min: "0", max: "100" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Smelted Gold (oz)"
                    type="number"
                    name="smelted_gold"
                    value={formData.smelted_gold}
                    onChange={(e) => setFormData(prev => ({ ...prev, smelted_gold: e.target.value }))}
                    required
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Gold Price ($)"
                    type="number"
                    name="gold_price"
                    value={formData.gold_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, gold_price: e.target.value }))}
                    required
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setOpenDialog(false)}
                variant="outlined"
                sx={{
                  borderColor: theme.palette.grey[500],
                  color: theme.palette.grey[500],
                  '&:hover': {
                    borderColor: theme.palette.grey[700],
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || updateMutation.isPending}
                sx={{
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  color: 'white',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  },
                  minWidth: '100px',
                }}
                startIcon={createMutation.isPending || updateMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {selectedRecord ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, record: null })}
          PaperProps={{
            sx: {
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(40,40,40,0.95) 0%, rgba(20,20,20,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '12px',
            }
          }}
        >
          <DialogTitle sx={{ color: theme.palette.error.main }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the production record for{' '}
              <strong>{deleteDialog.record && format(new Date(deleteDialog.record.date), 'MMMM dd, yyyy')}</strong>?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, record: null })}
              variant="outlined"
              sx={{
                borderColor: theme.palette.grey[500],
                color: theme.palette.grey[500],
                '&:hover': {
                  borderColor: theme.palette.grey[700],
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteDialog.record) {
                  handleDelete(deleteDialog.record.date);
                  setDeleteDialog({ open: false, record: null });
                }
              }}
              variant="contained"
              color="error"
              disabled={deleteMutation.isPending}
              sx={{
                background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                color: 'white',
                boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c62828 30%, #d32f2f 90%)',
                },
                minWidth: '100px',
              }}
              startIcon={deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Menu */}
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
          PaperProps={{
            sx: {
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(40,40,40,0.95) 0%, rgba(20,20,20,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '8px',
              mt: 1,
            }
          }}
        >
          <MenuItem onClick={handleExportCSV}>
            <ListItemIcon>
              <TableViewIcon fontSize="small" />
            </ListItemIcon>
            Export as CSV
          </MenuItem>
          <MenuItem onClick={handleExportPDF}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" />
            </ListItemIcon>
            Export as PDF
          </MenuItem>
        </Menu>
      </Container>
    </Layout>
  );
};

export default Production;
