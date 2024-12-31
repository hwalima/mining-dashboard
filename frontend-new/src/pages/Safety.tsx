import React, { useState, useEffect } from 'react';
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
  MenuItem,
  IconButton,
  Paper,
  useTheme,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Fade,
  Zoom,
  Card,
  CardContent,
  Tooltip,
  LinearProgress,
  alpha,
  Slide,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Layout from '../components/layout/Layout';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useDateFilterContext } from '../contexts/DateFilterContext';
import { useCompanySettings } from '../contexts/CompanySettingsContext';
import DateFilter from '../components/common/DateFilter';
import { format, subDays } from 'date-fns';
import { safetyService, SafetyIncident } from '../services/api';
import { departmentService } from '../services/api';
import { zoneService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

interface FormData {
  date: string;
  incident_type: string;
  severity: string;
  description: string;
  department?: string;
  zone?: string;
  investigation_status: string;
  corrective_actions?: string;
}

const INITIAL_FORM_DATA: FormData = {
  date: new Date().toISOString().split('T')[0],
  incident_type: '',
  severity: '',
  description: '',
  department: '',
  zone: '',
  investigation_status: 'pending',
  corrective_actions: '',
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const INCIDENT_TYPES = ['injury', 'near_miss', 'property_damage', 'environmental', 'other'] as const;
const INVESTIGATION_STATUS = ['pending', 'in_progress', 'completed', 'closed'];

const getSeverityColor = (severity: string) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    critical: '#d32f2f',
  };
  return colors[severity] || colors.low;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    case 'in_progress':
      return <InfoIcon sx={{ color: 'info.main' }} />;
    case 'pending':
      return <ErrorIcon sx={{ color: 'warning.main' }} />;
    default:
      return <WarningIcon sx={{ color: 'error.main' }} />;
  }
};

const MotionTableRow = motion.create(TableRow);

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const Safety: React.FC = () => {
  const theme = useTheme();
  const { settings: companySettings } = useCompanySettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SafetyIncident | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectAllFiltered, setSelectAllFiltered] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  const queryClient = useQueryClient();
  const { dateRange } = useDateFilterContext();

  const { data, isLoading, error } = useQuery({
    queryKey: ['safetyIncidents', dateRange, page, rowsPerPage],
    queryFn: async () => {
      try {
        const response = await safetyService.getSafetyIncidents({
          from_date: format(dateRange.startDate || subDays(new Date(), 30), 'yyyy-MM-dd'),
          to_date: format(dateRange.endDate || new Date(), 'yyyy-MM-dd'),
          page,
          rowsPerPage
        });

        console.log('API Response:', {
          summary: response?.summary,
          totalIncidents: response?.summary?.total_incidents,
          recentIncidents: response?.recent_incidents?.length
        });

        return response;
      } catch (error) {
        console.error('Error fetching safety incidents:', error);
        throw error;
      }
    }
  });

  const incidents = data?.recent_incidents || [];
  const total = data?.summary?.total_incidents || 0;
  
  console.log('Pagination State:', {
    currentPage: page,
    rowsPerPage,
    totalRecords: total,
    currentIncidents: incidents.length,
    hasData: !!data
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log('Page Change:', { from: page, to: newPage });
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('Rows Per Page Change:', { from: rowsPerPage, to: newRowsPerPage });
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const createMutation = useMutation({
    mutationFn: async ({ data }: { data: Partial<SafetyIncident> }) => {
      console.log('Creating safety incident with data:', data);
      const response = await safetyService.createIncident(data);
      console.log('Create response:', response);
      return response;
    },
    onSuccess: () => {
      console.log('Successfully created safety incident');
      queryClient.invalidateQueries({ queryKey: ['safetyIncidents'] });
      setOpenDialog(false);
      setFormData(INITIAL_FORM_DATA);
      setFormError(null);
    },
    onError: (error: any) => {
      console.error('Error creating safety incident:', error.response?.data || error);
      setFormError(error.response?.data?.error || 'Failed to create incident record');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SafetyIncident> }) => {
      console.log('Updating safety incident:', id, 'with data:', data);
      const response = await safetyService.updateIncident(id, data);
      console.log('Update response:', response);
      return response;
    },
    onSuccess: () => {
      console.log('Successfully updated safety incident');
      queryClient.invalidateQueries({ queryKey: ['safetyIncidents'] });
      setOpenDialog(false);
      setSelectedRecord(null);
      setFormData(INITIAL_FORM_DATA);
      setFormError(null);
    },
    onError: (error: any) => {
      console.error('Error updating safety incident:', error.response?.data || error);
      setFormError(error.response?.data?.error || 'Failed to update incident record');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      console.log('Deleting safety incident:', id);
      const response = await safetyService.deleteIncident(id);
      console.log('Delete response:', response);
      return response;
    },
    onSuccess: () => {
      console.log('Successfully deleted safety incident');
      queryClient.invalidateQueries({ queryKey: ['safetyIncidents'] });
      setSelectedRecord(null);
    },
    onError: (error: any) => {
      console.error('Error deleting safety incident:', error.response?.data || error);
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    console.log('Form submitted with data:', formData);

    // Validate incident type
    if (!INCIDENT_TYPES.includes(formData.incident_type as any)) {
      console.error('Invalid incident type:', formData.incident_type);
      setFormError('Invalid incident type selected');
      return;
    }

    try {
      if (selectedRecord) {
        console.log('Updating existing record:', selectedRecord.id);
        await updateMutation.mutateAsync({ 
          id: selectedRecord.id, 
          data: formData 
        });
      } else {
        console.log('Creating new record');
        await createMutation.mutateAsync({ data: formData });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this incident record?')) {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleEdit = (record: SafetyIncident) => {
    console.log('Editing record:', record);
    setSelectedRecord(record);
    // Transform invalid incident type to a valid one
    const incidentType = INCIDENT_TYPES.includes(record.incident_type as any) 
      ? record.incident_type 
      : record.incident_type === 'equipment_failure' ? 'property_damage' : 'other';
    
    console.log('Transformed incident type:', record.incident_type, '->', incidentType);
      
    setFormData({
      date: record.date,
      incident_type: incidentType,
      severity: record.severity,
      description: record.description,
      department: record.department,
      zone: record.zone,
      investigation_status: record.investigation_status,
      corrective_actions: record.corrective_actions || '',
    });
    setOpenDialog(true);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('Export button clicked');
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const { data: exportData } = useQuery({
    queryKey: ['safetyExport', dateRange],
    queryFn: () => safetyService.getAllSafetyIncidents({
      from_date: format(dateRange.startDate || subDays(new Date(), 30), 'yyyy-MM-dd'),
      to_date: format(dateRange.endDate || new Date(), 'yyyy-MM-dd')
    }),
    enabled: false // Only run when exporting
  });

  const handleExportCSV = async () => {
    setExportLoading(true);
    console.log('Exporting to CSV...');

    try {
      await queryClient.prefetchQuery({
        queryKey: ['safetyExport', dateRange],
        queryFn: () => safetyService.getAllSafetyIncidents({
          from_date: format(dateRange.startDate || subDays(new Date(), 30), 'yyyy-MM-dd'),
          to_date: format(dateRange.endDate || new Date(), 'yyyy-MM-dd')
        })
      });

      console.log('Export data received:', {
        totalIncidents: exportData?.summary?.total_incidents,
        recordsCount: exportData?.recent_incidents?.length
      });

      if (!exportData?.recent_incidents) {
        console.error('No incidents data available for export');
        return;
      }

      const csvData = exportData.recent_incidents.map(record => ({
        Date: format(new Date(record.date), 'yyyy-MM-dd HH:mm'),
        'Incident Type': record.incident_type.replace('_', ' '),
        Severity: record.severity,
        Description: record.description,
        Department: record.department,
        Zone: record.zone,
        'Investigation Status': record.investigation_status.replace('_', ' '),
        'Corrective Actions': record.corrective_actions
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `safety_incidents_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setExportLoading(false);
      handleExportClose();
    }
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    console.log('Exporting to PDF with company settings:', companySettings);

    try {
      await queryClient.prefetchQuery({
        queryKey: ['safetyExport', dateRange],
        queryFn: () => safetyService.getAllSafetyIncidents({
          from_date: format(dateRange.startDate || subDays(new Date(), 30), 'yyyy-MM-dd'),
          to_date: format(dateRange.endDate || new Date(), 'yyyy-MM-dd')
        })
      });

      console.log('Export data received:', {
        totalIncidents: exportData?.summary?.total_incidents,
        recordsCount: exportData?.recent_incidents?.length
      });

      if (!exportData?.recent_incidents) {
        console.error('No incidents data available for export');
        return;
      }

      const doc = new jsPDF();
      
      // Add company logo based on theme
      if (companySettings) {
        const logoToUse = theme.palette.mode === 'dark' ? companySettings.darkLogo : companySettings.lightLogo;
        if (logoToUse) {
          try {
            const logoWidth = 40;
            const logoHeight = 40;
            doc.addImage(logoToUse, 'PNG', 14, 10, logoWidth, logoHeight);
          } catch (logoError) {
            console.error('Error adding logo:', logoError);
          }
        }
        
        // Add company information with gold color
        doc.setTextColor(218, 165, 32); // Gold color
        doc.setFontSize(20);
        doc.text(companySettings.name || 'Mining Company Ltd.', 60, 25);
        doc.setFontSize(12);
        doc.text(companySettings.tagline || 'Excellence in Mining', 60, 35);
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
      doc.text('Safety Incident Records', 14, companySettings ? 80 : 20);
      
      // Add date range
      doc.setFontSize(10);
      doc.text(
        `Report Period: ${format(dateRange.startDate || subDays(new Date(), 30), 'dd/MM/yyyy')} - ${format(dateRange.endDate || new Date(), 'dd/MM/yyyy')}`,
        14,
        companySettings ? 90 : 30
      );

      // Add summary section
      doc.setFontSize(12);
      doc.text('Summary', 14, companySettings ? 100 : 40);
      
      doc.setFontSize(10);
      doc.text(`Total Incidents: ${exportData.summary.total_incidents}`, 14, companySettings ? 110 : 50);
      doc.text('Severity Breakdown:', 14, companySettings ? 115 : 55);
      doc.text(`Critical: ${exportData.summary.severity_counts.critical}`, 24, companySettings ? 120 : 60);
      doc.text(`High: ${exportData.summary.severity_counts.high}`, 24, companySettings ? 125 : 65);
      doc.text(`Medium: ${exportData.summary.severity_counts.medium}`, 24, companySettings ? 130 : 70);
      doc.text(`Low: ${exportData.summary.severity_counts.low}`, 24, companySettings ? 135 : 75);

      // Table headers
      const headers = [
        'Date',
        'Type',
        'Severity',
        'Description',
        'Department',
        'Status',
        'Actions'
      ];
      
      const tableRows = exportData.recent_incidents.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.incident_type.replace('_', ' '),
        record.severity,
        record.description,
        record.department,
        record.investigation_status.replace('_', ' '),
        record.corrective_actions
      ]);

      doc.autoTable({
        head: [headers],
        body: tableRows,
        startY: companySettings ? 145 : 85,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [218, 165, 32], // Gold color for header
          textColor: [0, 0, 0], // Black text for better contrast
          fontSize: 8,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Date
          1: { cellWidth: 25 }, // Type
          2: { cellWidth: 20 }, // Severity
          3: { cellWidth: 'auto' }, // Description
          4: { cellWidth: 25 }, // Department
          5: { cellWidth: 25 }, // Status
          6: { cellWidth: 'auto' }  // Actions
        },
      });

      // Add page numbers
      const pageCount = (doc as any).internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }

      doc.save(`safety_incidents_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      // enqueueSnackbar('Error exporting to PDF', { variant: 'error' });
    } finally {
      setExportLoading(false);
      handleExportClose();
    }
  };

  // Fetch departments
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments(),
    staleTime: 300000, // 5 minutes
  });

  // Fetch zones
  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneService.getZones(),
    staleTime: 300000, // 5 minutes
  });

  // Sort function
  const sortData = (data: SafetyIncident[]) => {
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

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Fade in timeout={800}>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Safety Incidents
                  </Typography>
                  <Typography variant="subtitle1" sx={{ ml: 2, color: 'text.secondary' }}>
                    ({total} total records)
                  </Typography>
                  {data?.summary && (
                    <Box sx={{ ml: 2, display: 'flex', gap: 2 }}>
                      <Chip 
                        label={`High/Critical: ${data.summary.severity_counts.high + data.summary.severity_counts.critical}`}
                        color="error"
                        size="small"
                      />
                      <Chip 
                        label={`Medium: ${data.summary.severity_counts.medium}`}
                        color="warning"
                        size="small"
                      />
                      <Chip 
                        label={`Low: ${data.summary.severity_counts.low}`}
                        color="success"
                        size="small"
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                <Zoom in timeout={1000}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedRecord(null);
                        setFormData(INITIAL_FORM_DATA);
                        setOpenDialog(true);
                      }}
                      sx={{
                        borderRadius: '24px',
                        px: 3,
                        py: 1,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        },
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      }}
                    >
                      Add New Incident
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownloadIcon />}
                      onClick={handleExportClick}
                    >
                      Export
                    </Button>
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
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
          </Fade>

          <Fade in timeout={1000}>
            <Card 
              sx={{ 
                mb: 4,
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)',
              }}
            >
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search incidents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <DateFilter />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>

          {error ? (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                animation: 'shake 0.5s',
                '@keyframes shake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                  '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                },
              }}
            >
              Error loading safety incidents. Please try again later.
            </Alert>
          ) : (
            <Fade in timeout={1200}>
              <Card sx={{ 
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        background: alpha(theme.palette.primary.main, 0.05),
                      }}>
                        <TableCell
                          onClick={() => handleRequestSort('date')}
                          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Date {getSortDirectionIcon('date')}
                        </TableCell>
                        <TableCell
                          onClick={() => handleRequestSort('incident_type')}
                          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Type {getSortDirectionIcon('incident_type')}
                        </TableCell>
                        <TableCell
                          onClick={() => handleRequestSort('severity')}
                          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Severity {getSortDirectionIcon('severity')}
                        </TableCell>
                        <TableCell
                          onClick={() => handleRequestSort('description')}
                          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Description {getSortDirectionIcon('description')}
                        </TableCell>
                        <TableCell
                          onClick={() => handleRequestSort('department')}
                          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Department {getSortDirectionIcon('department')}
                        </TableCell>
                        <TableCell
                          onClick={() => handleRequestSort('investigation_status')}
                          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Status {getSortDirectionIcon('investigation_status')}
                        </TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <Box sx={{ width: '100%', mt: 2 }}>
                              <LinearProgress sx={{ borderRadius: 1 }} />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : incidents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                              No incidents found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <AnimatePresence>
                          {sortData(incidents)
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((incident, index) => (
                              <MotionTableRow
                                key={incident.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <TableCell>{format(new Date(incident.date), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={incident.incident_type.replace('_', ' ')}
                                    size="small"
                                    sx={{ 
                                      borderRadius: '8px',
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      color: theme.palette.primary.main,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={incident.severity}
                                    size="small"
                                    sx={{ 
                                      borderRadius: '8px',
                                      backgroundColor: alpha(getSeverityColor(incident.severity), 0.1),
                                      color: getSeverityColor(incident.severity),
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={incident.description}>
                                    <Typography noWrap sx={{ maxWidth: 200 }}>
                                      {incident.description}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    {incident.department || '-'}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getStatusIcon(incident.investigation_status)}
                                    {incident.investigation_status.replace('_', ' ')}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEdit(incident)}
                                      sx={{
                                        mr: 1,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                          transform: 'scale(1.1)',
                                        },
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDelete(incident.id)}
                                      sx={{
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                                          transform: 'scale(1.1)',
                                        },
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </MotionTableRow>
                            ))}
                        </AnimatePresence>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                  component="div"
                  count={total}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} of ${count} records`
                  }
                  sx={{
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                />
              </Card>
            </Fade>
          )}
        </Box>

        <Dialog 
          open={openDialog} 
          onClose={() => {
            setOpenDialog(false);
            setFormError(null);
          }}
          maxWidth="md"
          fullWidth
          TransitionComponent={Slide}
          TransitionProps={{ direction: 'up' }}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
            },
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            '& .MuiTypography-root': {
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            },
          }}>
            {selectedRecord ? 'Edit Safety Incident' : 'Add Safety Incident'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Incident Type</InputLabel>
                    <Select
                      value={formData.incident_type}
                      onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                      label="Incident Type"
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: '12px',
                        },
                      }}
                    >
                      {INCIDENT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon sx={{ fontSize: 20 }} />
                            {type.replace('_', ' ')}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      label="Severity"
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: '12px',
                        },
                      }}
                    >
                      {SEVERITY_OPTIONS.map((severity) => (
                        <MenuItem key={severity} value={severity}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getSeverityColor(severity),
                              }}
                            />
                            {severity}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Investigation Status</InputLabel>
                    <Select
                      value={formData.investigation_status}
                      onChange={(e) => setFormData({ ...formData, investigation_status: e.target.value })}
                      label="Investigation Status"
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: '12px',
                        },
                      }}
                    >
                      {INVESTIGATION_STATUS.map((status) => (
                        <MenuItem key={status} value={status}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(status)}
                            {status.replace('_', ' ')}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      label="Department"
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: '12px',
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {departmentsLoading ? (
                        <MenuItem value="">
                          <em>Loading...</em>
                        </MenuItem>
                      ) : departments?.map((dept) => (
                        <MenuItem key={dept.id} value={dept.name}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon sx={{ fontSize: 20 }} />
                            {dept.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Zone</InputLabel>
                    <Select
                      value={formData.zone || ''}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      label="Zone"
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: '12px',
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {zonesLoading ? (
                        <MenuItem value="">
                          <em>Loading...</em>
                        </MenuItem>
                      ) : zones?.map((zone) => (
                        <MenuItem key={zone.id} value={zone.name}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 20 }} />
                            {zone.name} - {zone.code}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: <DescriptionIcon sx={{ mt: 1, mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Corrective Actions"
                    multiline
                    rows={3}
                    value={formData.corrective_actions || ''}
                    onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                    InputProps={{
                      startAdornment: <BuildIcon sx={{ mt: 1, mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {formError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2,
                    borderRadius: '12px',
                    animation: 'shake 0.5s',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                    },
                  }}
                >
                  {formError}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => {
                  setOpenDialog(false);
                  setFormError(null);
                }}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={createMutation.isPending || updateMutation.isPending}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                }}
              >
                {selectedRecord ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Safety;
