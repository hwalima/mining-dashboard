import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  DataUsage as DataUsageIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import { useCompanySettings } from '../contexts/CompanySettingsContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../services/api';
import EquipmentTable from '../components/tables/EquipmentTable';
import ChemicalsTable from '../components/settings/ChemicalsTable';
import { zoneService } from '../services/api';
import { Zone, ZoneFormData } from '../types/zone';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const { settings, updateSettings } = useCompanySettings();
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'extraction' as Department['type'],
    description: '',
  });
  const [zones, setZones] = useState<Zone[]>([]);
  const [openZoneDialog, setOpenZoneDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [zoneFormData, setZoneFormData] = useState<ZoneFormData>({
    name: '',
    code: '',
    area_type: 'extraction',
    risk_level: 'low',
    description: '',
    max_occupancy: 0,
    requires_certification: false,
  });
  const lightLogoInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    tagline: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    lightLogo: '',
    darkLogo: '',
    favicon: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    fetchDepartments();
    fetchZones();
  }, []);

  useEffect(() => {
    if (settings) {
      setCompanyFormData(settings);
    }
  }, [settings]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      console.log('Fetched departments:', data); // Debug log
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Add error state handling if needed
    }
  };

  const fetchZones = async () => {
    try {
      const data = await zoneService.getZones();
      setZones(data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleOpenDialog = (department?: any) => {
    if (department) {
      setSelectedDepartment(department);
      setFormData({
        name: department.name,
        type: department.type,
        description: department.description || '',
      });
    } else {
      setSelectedDepartment(null);
      setFormData({
        name: '',
        type: 'extraction' as Department['type'],
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepartment(null);
    setFormData({
      name: '',
      type: 'extraction' as Department['type'],
      description: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedDepartment) {
        await departmentService.updateDepartment(selectedDepartment.id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      handleCloseDialog();
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentService.deleteDepartment(id);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const handleOpenZoneDialog = (zone?: Zone) => {
    if (zone) {
      setSelectedZone(zone);
      setZoneFormData({
        name: zone.name,
        code: zone.code,
        area_type: zone.area_type,
        risk_level: zone.risk_level,
        description: zone.description,
        max_occupancy: zone.max_occupancy,
        requires_certification: zone.requires_certification,
      });
    } else {
      setSelectedZone(null);
      setZoneFormData({
        name: '',
        code: '',
        area_type: 'extraction',
        risk_level: 'low',
        description: '',
        max_occupancy: 0,
        requires_certification: false,
      });
    }
    setOpenZoneDialog(true);
  };

  const handleCloseZoneDialog = () => {
    setOpenZoneDialog(false);
    setSelectedZone(null);
  };

  const handleZoneSubmit = async () => {
    try {
      if (selectedZone) {
        await zoneService.updateZone(selectedZone.id, zoneFormData);
      } else {
        await zoneService.createZone(zoneFormData);
      }
      handleCloseZoneDialog();
      fetchZones();
    } catch (error) {
      console.error('Error saving zone:', error);
    }
  };

  const handleZoneDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      try {
        await zoneService.deleteZone(id);
        fetchZones();
      } catch (error) {
        console.error('Error deleting zone:', error);
      }
    }
  };

  const handleFileUpload = (type: 'lightLogo' | 'darkLogo' | 'favicon') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setCompanyFormData(prev => ({
          ...prev,
          [type]: reader.result as string
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleCompanySettingsSave = async () => {
    try {
      await updateSettings(companyFormData);
    } catch (error) {
      console.error('Error saving company settings:', error);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="settings tabs">
              <Tab icon={<BusinessIcon />} label="Company" />
              <Tab icon={<BuildIcon />} label="Equipment" />
              <Tab icon={<DataUsageIcon />} label="Chemicals" />
              <Tab icon={<BusinessIcon />} label="Departments" />
              <Tab icon={<BusinessIcon />} label="Zones" />
              <Tab icon={<SecurityIcon />} label="Security" />
              <Tab icon={<NotificationsIcon />} label="Notifications" />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0}>
            {/* Company Settings */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  placeholder="Hwalima digital"
                  value={companyFormData.name}
                  onChange={(e) => setCompanyFormData(prev => ({ ...prev, name: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Tagline"
                  placeholder="Digital Inspiration"
                  value={companyFormData.tagline}
                  onChange={(e) => setCompanyFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  placeholder="info@hwalima.digital"
                  value={companyFormData.email}
                  onChange={(e) => setCompanyFormData(prev => ({ ...prev, email: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  placeholder="0785425978"
                  value={companyFormData.phone}
                  onChange={(e) => setCompanyFormData(prev => ({ ...prev, phone: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  placeholder="66 Donovan Street"
                  value={companyFormData.address}
                  onChange={(e) => setCompanyFormData(prev => ({ ...prev, address: e.target.value }))}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Website"
                  placeholder="https://www.hwalima.digital/"
                  value={companyFormData.website}
                  onChange={(e) => setCompanyFormData(prev => ({ ...prev, website: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              {/* Logo Upload Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Company Logos</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 2,
                        border: `1px dashed ${theme.palette.divider}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                      onClick={() => lightLogoInputRef.current?.click()}
                    >
                      {companyFormData.lightLogo ? (
                        <Avatar
                          src={companyFormData.lightLogo}
                          variant="rounded"
                          sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
                        />
                      ) : (
                        <ImageIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                      )}
                      <Typography variant="body2">Light Logo</Typography>
                      <input
                        type="file"
                        ref={lightLogoInputRef}
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload('lightLogo')}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 2,
                        border: `1px dashed ${theme.palette.divider}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: theme.palette.grey[900],
                        '&:hover': {
                          bgcolor: theme.palette.grey[800],
                        },
                      }}
                      onClick={() => darkLogoInputRef.current?.click()}
                    >
                      {companyFormData.darkLogo ? (
                        <Avatar
                          src={companyFormData.darkLogo}
                          variant="rounded"
                          sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
                        />
                      ) : (
                        <ImageIcon sx={{ fontSize: 40, color: theme.palette.grey[300], mb: 1 }} />
                      )}
                      <Typography variant="body2" sx={{ color: theme.palette.grey[300] }}>Dark Logo</Typography>
                      <input
                        type="file"
                        ref={darkLogoInputRef}
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload('darkLogo')}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 2,
                        border: `1px dashed ${theme.palette.divider}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                      onClick={() => faviconInputRef.current?.click()}
                    >
                      {companyFormData.favicon ? (
                        <Avatar
                          src={companyFormData.favicon}
                          variant="rounded"
                          sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
                        />
                      ) : (
                        <ImageIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                      )}
                      <Typography variant="body2">Favicon</Typography>
                      <input
                        type="file"
                        ref={faviconInputRef}
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload('favicon')}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleCompanySettingsSave}
                sx={{
                  borderRadius: '8px',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Save Company Information
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            {/* Equipment Management */}
            <EquipmentTable />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            {/* Chemicals Management */}
            <ChemicalsTable />
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            {/* Departments Management */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Departments</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                      borderRadius: '8px',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    Add Department
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Manager</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departments.map((department: any) => (
                        <TableRow key={department.id}>
                          <TableCell>{department.name}</TableCell>
                          <TableCell>{department.description}</TableCell>
                          <TableCell>{department.manager}</TableCell>
                          <TableCell>{department.location}</TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => handleOpenDialog(department)} size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(department.id)} size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={currentTab} index={4}>
            {/* Zones Management */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Zones</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenZoneDialog()}
                    sx={{
                      borderRadius: '8px',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    Add Zone
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell>Area Type</TableCell>
                        <TableCell>Risk Level</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Max Occupancy</TableCell>
                        <TableCell>Requires Certification</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {zones.map((zone: Zone) => (
                        <TableRow key={zone.id}>
                          <TableCell>{zone.name}</TableCell>
                          <TableCell>{zone.code}</TableCell>
                          <TableCell>{zone.area_type}</TableCell>
                          <TableCell>{zone.risk_level}</TableCell>
                          <TableCell>{zone.description}</TableCell>
                          <TableCell>{zone.max_occupancy}</TableCell>
                          <TableCell>{zone.requires_certification ? 'Yes' : 'No'}</TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => handleOpenZoneDialog(zone)} size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleZoneDelete(zone.id)} size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={currentTab} index={5}>
            {/* Security Settings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Two-factor authentication"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Login notifications"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={currentTab} index={6}>
            {/* Notification Settings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Email notifications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Push notifications"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </Container>

      {/* Department Dialog */}
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
          {selectedDepartment ? 'Edit Department' : 'Add Department'}
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
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
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
            {selectedDepartment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Zone Dialog */}
      <Dialog 
        open={openZoneDialog} 
        onClose={handleCloseZoneDialog}
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
          {selectedZone ? 'Edit Zone' : 'Add Zone'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={zoneFormData.name}
              onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Code"
              value={zoneFormData.code}
              onChange={(e) => setZoneFormData({ ...zoneFormData, code: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Area Type</InputLabel>
              <Select
                value={zoneFormData.area_type}
                onChange={(e) => setZoneFormData({ ...zoneFormData, area_type: e.target.value as Zone['area_type'] })}
                label="Area Type"
              >
                <MenuItem value="extraction">Extraction</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="storage">Storage</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="office">Office</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={zoneFormData.risk_level}
                onChange={(e) => setZoneFormData({ ...zoneFormData, risk_level: e.target.value as Zone['risk_level'] })}
                label="Risk Level"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              value={zoneFormData.description}
              onChange={(e) => setZoneFormData({ ...zoneFormData, description: e.target.value })}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Max Occupancy"
              type="number"
              value={zoneFormData.max_occupancy}
              onChange={(e) => setZoneFormData({ ...zoneFormData, max_occupancy: parseInt(e.target.value) })}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={zoneFormData.requires_certification}
                  onChange={(e) => setZoneFormData({ ...zoneFormData, requires_certification: e.target.checked })}
                />
              }
              label="Requires Certification"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseZoneDialog}>Cancel</Button>
          <Button
            onClick={handleZoneSubmit}
            variant="contained"
            sx={{
              borderRadius: '8px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {selectedZone ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Settings;
