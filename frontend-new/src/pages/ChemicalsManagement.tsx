import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  MenuItem,
  Alert,
  Menu,
  ListItemIcon,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  TableView as TableViewIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, subDays } from 'date-fns';
import { chemicalsService } from '../services/chemicals';
import Layout from '../components/layout/Layout';
import DateFilter from '../components/common/DateFilter';
import { useDateFilterContext } from '../contexts/DateFilterContext';
import { useCompanySettings } from '../contexts/CompanySettingsContext';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/icon light background.png';

interface ChemicalUsageRecord {
  id: number;
  date: string;
  chemical: {
    id: number;
    name: string;
    unit: string;
  };
  amount_used: number;
  process: string;
  notes: string | null;
}

interface ChemicalOption {
  id: number;
  name: string;
  unit: string;
  unit_price: number;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const ChemicalsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { settings: companySettings } = useCompanySettings();
  const { dateRange } = useDateFilterContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ChemicalUsageRecord | null>(null);
  const [formData, setFormData] = useState({
    date: new Date(),
    chemical_id: '',
    amount_used: '',
    process: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch chemical usage records
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['chemicalUsage', dateRange.startDate, dateRange.endDate],
    queryFn: () => chemicalsService.getChemicalUsageRecords(
      dateRange.startDate || subDays(new Date('2024-12-23T19:19:45+02:00'), 30),
      dateRange.endDate || new Date('2024-12-23T19:19:45+02:00')
    ),
  });

  // Fetch chemical options for dropdown
  const { data: chemicals = [] } = useQuery({
    queryKey: ['chemicals'],
    queryFn: chemicalsService.getChemicals,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: chemicalsService.createChemicalUsageRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chemicalUsage'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create record');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: chemicalsService.updateChemicalUsageRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chemicalUsage'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update record');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: chemicalsService.deleteChemicalUsageRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chemicalUsage'] });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to delete record');
    },
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (record?: ChemicalUsageRecord) => {
    if (record) {
      setSelectedRecord(record);
      setFormData({
        date: new Date(record.date),
        chemical_id: record.chemical.id.toString(),
        amount_used: record.amount_used.toString(),
        process: record.process,
        notes: record.notes || '',
      });
    } else {
      setSelectedRecord(null);
      setFormData({
        date: new Date(),
        chemical_id: '',
        amount_used: '',
        process: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
    setFormData({
      date: new Date(),
      chemical_id: '',
      amount_used: '',
      process: '',
      notes: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      date: format(formData.date, 'yyyy-MM-dd'),
      chemical_id: parseInt(formData.chemical_id),
      amount_used: parseFloat(formData.amount_used),
      process: formData.process,
      notes: formData.notes || null,
    };

    if (selectedRecord) {
      updateMutation.mutate({ id: selectedRecord.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportCSV = () => {
    const csvData = filteredRecords.map((record: ChemicalUsageRecord) => ({
      Date: format(new Date(record.date), 'yyyy-MM-dd'),
      Chemical: record.chemical.name,
      'Amount Used': `${record.amount_used} ${record.chemical.unit}`,
      Process: record.process,
      Notes: record.notes || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `chemical_usage_${format(new Date('2024-12-23T19:32:26+02:00'), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleExportClose();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add company logo based on theme
    if (companySettings) {
      const logoToUse = theme.palette.mode === 'dark' ? companySettings.darkLogo : companySettings.lightLogo;
      if (logoToUse) {
        const logoWidth = 40;
        const logoHeight = 40;
        doc.addImage(logoToUse, 'PNG', 14, 10, logoWidth, logoHeight);
      } else {
        doc.addImage(logo, 'PNG', 14, 10, 40, 40);
      }
      
      // Add company information with gold color
      doc.setTextColor(218, 165, 32); // Gold color
      doc.setFontSize(20);
      doc.text(companySettings.name || 'Mining Company Ltd.', 60, 25);
      doc.setFontSize(12);
      doc.text(companySettings.tagline || 'Excellence in Mining Operations', 60, 35);
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
    
    // Add report title and summary
    doc.setTextColor(0, 0, 0); // Reset to black color
    doc.setFontSize(16);
    doc.text('Chemical Usage Records', 14, companySettings ? 80 : 20);
    
    // Calculate total price for the period
    const totalPrice = filteredRecords.reduce((sum, record) => {
      const chemical = chemicals.find(c => c.id === record.chemical.id);
      return sum + (chemical?.unit_price || 0) * record.amount_used;
    }, 0);
    
    // Add date range and total price
    doc.setFontSize(10);
    doc.text([
      `Report Period: ${format(dateRange.startDate || subDays(new Date(), 30), 'dd/MM/yyyy')} - ${format(dateRange.endDate || new Date(), 'dd/MM/yyyy')}`,
      `Total Cost: $${totalPrice.toFixed(2)}`
    ], 14, companySettings ? 90 : 30);

    const tableColumn = [
      'Date',
      'Chemical',
      'Amount Used',
      'Process',
      'Notes'
    ];

    const tableRows = filteredRecords.map((record: ChemicalUsageRecord) => [
      format(new Date(record.date), 'dd/MM/yyyy'),
      record.chemical.name,
      `${record.amount_used} ${record.chemical.unit}`,
      record.process,
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
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 35 }, // Chemical
        2: { cellWidth: 30 }, // Amount Used
        3: { cellWidth: 35 }, // Process
        4: { cellWidth: 'auto' } // Notes
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
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        'Chemical Usage Report',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`chemical_usage_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    handleExportClose();
  };

  // Filter records based on search term and date range
  const filteredRecords = useMemo(() => {
    return (records || []).filter((record: ChemicalUsageRecord) => {
      const recordDate = new Date(record.date);
      const startDate = dateRange.startDate || subDays(new Date('2024-12-23T19:25:59+02:00'), 30);
      const endDate = dateRange.endDate || new Date('2024-12-23T19:25:59+02:00');
      
      const matchesDate = recordDate >= startDate && recordDate <= endDate;
      const matchesSearch = searchTerm === '' || 
        record.chemical.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesDate && matchesSearch;
    });
  }, [records, searchTerm, dateRange.startDate, dateRange.endDate]);

  return (
    <Layout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Chemical Usage Records</Typography>
          <Box display="flex" gap={2}>
            <DateFilter />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportClick}
              startIcon={<FileDownloadIcon />}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add New Record
            </Button>
          </Box>
        </Box>

        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={handleExportClose}
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

        <Box mb={3}>
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
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Chemical</TableCell>
                <TableCell>Amount Used</TableCell>
                <TableCell>Process</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record: ChemicalUsageRecord) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{record.chemical.name}</TableCell>
                    <TableCell>{record.amount_used}</TableCell>
                    <TableCell>{record.process}</TableCell>
                    <TableCell>{record.notes}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(record)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(record.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {selectedRecord ? 'Edit Chemical Usage Record' : 'New Chemical Usage Record'}
            </DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} pt={1}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                />
                <TextField
                  select
                  label="Chemical"
                  value={formData.chemical_id}
                  onChange={(e) => setFormData({ ...formData, chemical_id: e.target.value })}
                  required
                >
                  {chemicals.map((chemical: ChemicalOption) => (
                    <MenuItem key={chemical.id} value={chemical.id}>
                      {chemical.name} ({chemical.unit})
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Amount Used"
                  type="number"
                  value={formData.amount_used}
                  onChange={(e) => setFormData({ ...formData, amount_used: e.target.value })}
                  required
                />
                <TextField
                  label="Process"
                  value={formData.process}
                  onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                  required
                />
                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {selectedRecord ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ChemicalsManagement;
