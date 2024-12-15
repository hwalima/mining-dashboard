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

  if (loading) {
    return (
      <Paper elevation={3} sx={cardStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={cardStyle}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <HealthAndSafetyIcon sx={{ color: theme.palette.primary.main }} />
        <Typography variant="h6" component="h2">Safety Overview</Typography>
      </Box>

      {/* Main Stats Grid */}
      <Grid container spacing={2}>
        {/* Days Without Incidents */}
        <Grid item xs={12} md={6}>
          <Box sx={statBoxStyle}>
            <CheckCircleIcon sx={{ fontSize: 40, color: COLORS.low, mb: 1 }} />
            <Typography variant="h3" sx={{ color: COLORS.low, fontWeight: 'bold' }}>
              {filteredData?.summary?.days_without_incident || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Days Without Incidents
            </Typography>
          </Box>
        </Grid>

        {/* Severity Breakdown */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Box sx={severityBoxStyle(COLORS.low)}>
                <InfoIcon sx={{ color: COLORS.low }} />
                <Typography variant="h6" sx={{ color: COLORS.low }}>
                  {filteredData?.summary?.severity_breakdown?.low || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">Low</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={severityBoxStyle(COLORS.medium)}>
                <WarningIcon sx={{ color: COLORS.medium }} />
                <Typography variant="h6" sx={{ color: COLORS.medium }}>
                  {filteredData?.summary?.severity_breakdown?.medium || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">Medium</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={severityBoxStyle(COLORS.critical)}>
                <ErrorIcon sx={{ color: COLORS.critical }} />
                <Typography variant="h6" sx={{ color: COLORS.critical }}>
                  {filteredData?.summary?.severity_breakdown?.high || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">High</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Incident Type Distribution */}
        <Grid item xs={12}>
          <Box sx={{ 
            backgroundColor: alpha(theme.palette.background.paper, 0.1),
            borderRadius: '12px',
            p: 2,
            height: '300px'
          }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Incident Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export { SafetyWidget };
