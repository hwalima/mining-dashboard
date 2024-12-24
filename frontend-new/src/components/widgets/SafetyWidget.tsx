import React, { useMemo, useState, useCallback } from 'react';
import { Paper, Typography, Box, Grid, CircularProgress, Stack, useTheme, alpha, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ErrorIcon from '@mui/icons-material/Error';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { format, subDays } from 'date-fns';
import { useDateFilterContext } from '../../contexts/DateFilterContext';

interface SafetyIncident {
  id: number;
  date: string;
  incident_type: string;
  severity: string;
  description: string;
  department: string;
  zone: string;
  investigation_status: string;
  corrective_actions: string;
}

interface DepartmentStats {
  department: string;
  total_incidents: number;
  severity_breakdown: {
    [key: string]: number;
  };
  type_breakdown: {
    [key: string]: number;
  };
}

interface SafetyData {
  summary: {
    total_incidents: number;
    severity_counts: {
      [key: string]: number;
    };
    type_counts: {
      [key: string]: number;
    };
    status_counts: {
      [key: string]: number;
    };
    trend_percentage: number;
  };
  department_stats: DepartmentStats[];
  recent_incidents: SafetyIncident[];
}

interface SafetyWidgetProps {
  data?: SafetyData;
  loading?: boolean;
}

const COLORS = {
  low: '#00C49F',
  medium: '#FFBB28',
  high: '#FF8042',
  critical: '#FF4842',
  department: [
    '#2196F3', // Blue
    '#00C853', // Green
    '#FF6D00', // Orange
    '#AA00FF', // Purple
    '#C51162', // Pink
    '#FFD600', // Yellow
    '#00B8D4', // Cyan
    '#FF4081', // Pink accent
    '#651FFF', // Deep Purple
    '#3D5AFE', // Indigo accent
  ]
};

const departmentGradients = [
  ['#1E88E5', '#64B5F6'], // Blue gradient
  ['#00B050', '#4CAF50'], // Green gradient
  ['#FF6D00', '#FFB74D'], // Orange gradient
  ['#8E24AA', '#BA68C8'], // Purple gradient
  ['#D81B60', '#F06292'], // Pink gradient
  ['#FDD835', '#FFF176'], // Yellow gradient
  ['#00ACC1', '#4DD0E1'], // Cyan gradient
  ['#F50057', '#FF4081'], // Pink accent gradient
  ['#6200EA', '#7C4DFF'], // Deep Purple gradient
  ['#304FFE', '#536DFE'], // Indigo accent gradient
];

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'low':
      return COLORS.low;
    case 'medium':
      return COLORS.medium;
    case 'high':
      return COLORS.high;
    case 'critical':
      return COLORS.critical;
    default:
      return '#999';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'closed':
      return COLORS.low;
    case 'in_progress':
      return COLORS.medium;
    case 'pending':
      return COLORS.high;
    default:
      return '#999';
  }
};

const SafetyWidget: React.FC<SafetyWidgetProps> = ({ 
  data,
  loading = false 
}) => {
  const theme = useTheme();

  const cardStyle = {
    borderRadius: '16px',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, #2A2D3E, #1F1F1F)'
      : theme.palette.background.paper,
    p: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 3
  };

  const [dateRange, setDateRange] = useState<DateRange<Date>>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    key: 'selection'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSafetyData({
        from_date: format(dateRange.startDate || subDays(new Date(), 30), 'yyyy-MM-dd'),
        to_date: format(dateRange.endDate || new Date(), 'yyyy-MM-dd')
      });
      // Rest of the function remains the same
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Transform data for charts
  const severityData = useMemo(() => {
    if (!data?.summary?.severity_counts) return [];
    return Object.entries(data.summary.severity_counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [data]);

  const typeData = useMemo(() => {
    if (!data?.summary?.type_counts) return [];
    return Object.entries(data.summary.type_counts).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value
    }));
  }, [data]);

  const departmentData = useMemo(() => {
    if (!data?.department_stats) return [];
    return data.department_stats.map(dept => ({
      name: dept.department,
      incidents: dept.total_incidents
    }));
  }, [data]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
          : 'linear-gradient(145deg, #f8f9fa, #ffffff)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <HealthAndSafetyIcon color="primary" />
          <Typography variant="h6" component="h2">
            Safety Overview
          </Typography>
        </Stack>
        {data?.summary?.trend_percentage !== undefined && (
          <Chip
            icon={data.summary.trend_percentage > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${Math.abs(data.summary.trend_percentage)}% ${data.summary.trend_percentage > 0 ? 'increase' : 'decrease'}`}
            color={data.summary.trend_percentage > 0 ? 'error' : 'success'}
            variant="outlined"
          />
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : !data?.summary ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Typography color="error">No safety data available</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {/* Summary Stats */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 1, 
                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#fff', 0.9),
                border: `1px solid ${theme.palette.divider}`,
              }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <WarningIcon color="warning" />
                  <Typography variant="body2" color="text.secondary">
                    Total Incidents
                  </Typography>
                </Stack>
                <Typography variant="h4">
                  {data.summary.total_incidents}
                </Typography>
              </Box>
            </Grid>
            {Object.entries(data.summary.severity_counts || {}).map(([severity, count]) => (
              <Grid item xs={6} md={2} key={severity}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 1, 
                  bgcolor: alpha(getSeverityColor(severity), 0.1),
                  border: `1px solid ${alpha(getSeverityColor(severity), 0.2)}`,
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Typography>
                  <Typography variant="h5" sx={{ color: getSeverityColor(severity) }}>
                    {count}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {typeData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 1.5, height: 240 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Incidents by Type</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.department[index % COLORS.department.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            {departmentData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 1.5, 
                  height: 240,
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)' 
                    : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px 0 rgba(0,0,0,0.4)'
                    : '0 4px 20px 0 rgba(0,0,0,0.1)',
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Incidents by Department</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} barSize={20}>
                      <defs>
                        {departmentGradients.map((gradient, index) => (
                          <linearGradient
                            key={`gradient-${index}`}
                            id={`colorGradient${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor={gradient[0]} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={gradient[1]} stopOpacity={0.9} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
                      />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10, fill: theme.palette.text.primary }} 
                        axisLine={{ stroke: theme.palette.divider }}
                        tickLine={{ stroke: theme.palette.divider }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: theme.palette.text.primary }}
                        axisLine={{ stroke: theme.palette.divider }}
                        tickLine={{ stroke: theme.palette.divider }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="incidents" 
                        radius={[4, 4, 0, 0]}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#colorGradient${index % departmentGradients.length})`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Recent Incidents Table */}
          {data.recent_incidents && data.recent_incidents.length > 0 && (
            <Paper sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Recent Incidents</Typography>
              <TableContainer sx={{ maxHeight: 200 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recent_incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{format(new Date(incident.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{incident.incident_type.replace('_', ' ').toUpperCase()}</TableCell>
                        <TableCell>
                          <Chip
                            label={incident.severity}
                            size="small"
                            sx={{
                              bgcolor: alpha(getSeverityColor(incident.severity), 0.1),
                              color: getSeverityColor(incident.severity),
                              borderColor: getSeverityColor(incident.severity)
                            }}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{incident.department}</TableCell>
                        <TableCell>
                          <Chip
                            label={incident.investigation_status.replace('_', ' ')}
                            size="small"
                            sx={{
                              bgcolor: alpha(getStatusColor(incident.investigation_status), 0.1),
                              color: getStatusColor(incident.investigation_status),
                              borderColor: getStatusColor(incident.investigation_status)
                            }}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {incident.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}
    </Paper>
  );
};

export { SafetyWidget };
