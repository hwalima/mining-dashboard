import React, { useMemo } from 'react';
import { Paper, Typography, Box, Grid, CircularProgress, Stack, useTheme, alpha } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ErrorIcon from '@mui/icons-material/Error';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import InfoIcon from '@mui/icons-material/Info';
import { format, isWithinInterval } from 'date-fns';
import { useDateFilterContext } from '../../contexts/DateFilterContext';

interface SafetyData {
  incidents: Array<{
    id: number;
    date: string;
    type: string;
    severity: string;
    description: string;
    corrective_actions: string;
    department_name: string;
  }>;
  summary: {
    total_incidents: number;
    days_without_incident: number;
    severity_breakdown: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
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
  department: ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#0099C6']
};

const SafetyWidget: React.FC<SafetyWidgetProps> = ({ 
  data,
  loading = false 
}) => {
  const theme = useTheme();
  const { dateRange } = useDateFilterContext();

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

  const statBoxStyle = {
    backgroundColor: alpha(theme.palette.background.paper, 0.1),
    borderRadius: '12px',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const severityBoxStyle = (color: string) => ({
    backgroundColor: alpha(color, 0.1),
    borderRadius: '12px',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1
  });

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!data?.incidents) return null;

    const filteredIncidents = data.incidents.filter(incident => {
      const incidentDate = new Date(incident.date);
      return isWithinInterval(incidentDate, {
        start: dateRange.startDate,
        end: dateRange.endDate
      });
    });

    return {
      ...data,
      incidents: filteredIncidents
    };
  }, [data, dateRange]);

  // Create pie chart data
  const pieData = React.useMemo(() => {
    if (!filteredData?.incidents) return [];
    
    // Group incidents by type
    const typeData = filteredData.incidents.reduce((acc: { [key: string]: number }, incident) => {
      const type = incident.type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Convert to chart data format
    return Object.entries(typeData)
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS.department[index % COLORS.department.length]
      }));
  }, [filteredData]);

  const severityData = useMemo(() => {
    if (!filteredData?.summary) return [];

    return Object.entries(filteredData.summary.severity_breakdown)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [filteredData]);

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
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HealthAndSafetyIcon color="primary" />
        <Typography variant="h6" component="h2">
          Safety Overview
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Typography color="error">No safety data available</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#fff', 0.9),
                border: `1px solid ${theme.palette.divider}`,
              }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Days Without Incident
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ color: theme.palette.success.main }}>
                  {filteredData?.summary.days_without_incident}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#fff', 0.9),
                border: `1px solid ${theme.palette.divider}`,
              }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <WarningIcon color="warning" />
                  <Typography variant="body2" color="text.secondary">
                    Total Incidents
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ color: theme.palette.warning.main }}>
                  {filteredData?.summary.total_incidents}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Severity Breakdown
            </Typography>
            <Box sx={{ position: 'absolute', top: 24, left: 0, right: 0, bottom: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export { SafetyWidget };
