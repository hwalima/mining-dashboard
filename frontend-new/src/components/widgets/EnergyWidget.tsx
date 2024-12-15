import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { formatNumber } from '../../utils/formatters';
import TrendIndicator from '../common/TrendIndicator';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useEnergyData } from '../../hooks/useEnergyData';

const CHART_COLORS = {
  electricity: '#8884d8',
  diesel: '#82ca9d',
  cost: '#ffc658',
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  const theme = useTheme();
  const electricityData = payload.find((p: any) => p.dataKey === 'electricity_kwh');
  const dieselData = payload.find((p: any) => p.dataKey === 'diesel_liters');
  const costData = payload.find((p: any) => p.dataKey === 'total_cost');

  return (
    <Box
      sx={{
        bgcolor: theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.8)' 
          : 'rgba(255, 255, 255, 0.9)',
        p: 1.5,
        borderRadius: 1,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: `1px solid ${theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)'}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary }}>
        {label}
      </Typography>
      {electricityData && (
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Electricity: <strong>{formatNumber(electricityData.value)} kWh</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cost: <strong>${formatNumber(payload[0].payload.electricity_cost)}</strong>
          </Typography>
        </Box>
      )}
      {dieselData && (
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Diesel: <strong>{formatNumber(dieselData.value)} L</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cost: <strong>${formatNumber(payload[0].payload.diesel_cost)}</strong>
          </Typography>
        </Box>
      )}
      {costData && (
        <Box sx={{ pt: 0.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
            Total Cost: <strong>${formatNumber(costData.value)}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const EnergyWidget: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useEnergyData();

  const cardStyle = {
    borderRadius: '16px',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, #2A2D3E, #1F1F1F)'
      : theme.palette.background.paper,
    p: 3,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(64,64,64,.4)'
        : '0 16px 38px -12px rgba(0,0,0,0.56), 0 4px 25px 0 rgba(0,0,0,0.12), 0 8px 10px -5px rgba(0,0,0,0.2)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #8884d8, #82ca9d)',
    }
  };

  const metricCardStyle = {
    p: 2,
    borderRadius: '12px',
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)'}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)',
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 24px rgba(0,0,0,0.2)'
        : '0 8px 24px rgba(0,0,0,0.1)',
    }
  };

  const chartContainerStyle = {
    mt: 4,
    p: 2,
    borderRadius: '12px',
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)'}`,
    height: 300,
  };

  if (isLoading) {
    return (
      <Paper elevation={3} sx={cardStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress sx={{ color: CHART_COLORS.electricity }} />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={cardStyle}>
        <Alert 
          severity="error" 
          sx={{ 
            backgroundColor: 'rgba(211, 47, 47, 0.1)', 
            color: '#ff8a80',
            border: '1px solid rgba(211, 47, 47, 0.2)',
            borderRadius: 2,
          }}
        >
          Error loading energy data
        </Alert>
      </Paper>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Paper elevation={3} sx={cardStyle}>
        <Alert 
          severity="info" 
          sx={{ 
            backgroundColor: 'rgba(33, 150, 243, 0.1)', 
            color: '#90caf9',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            borderRadius: 2,
          }}
        >
          No energy data available for the selected period
        </Alert>
      </Paper>
    );
  }

  const { summary } = data;

  // Format data for the chart - take last 7 days only
  const chartData = [...data.data]
    .slice(0, 7)
    .reverse()
    .map(item => ({
      ...item,
      date: format(new Date(item.date), 'MMM d'),
      total_cost: item.electricity_cost + item.diesel_cost,
    }));

  // Calculate daily averages for comparison
  const previousDay = chartData[chartData.length - 2] || chartData[chartData.length - 1];
  const currentDay = chartData[chartData.length - 1];
  const electricityChange = previousDay && currentDay
    ? ((currentDay.electricity_kwh - previousDay.electricity_kwh) / previousDay.electricity_kwh) * 100
    : 0;
  const dieselChange = previousDay && currentDay
    ? ((currentDay.diesel_liters - previousDay.diesel_liters) / previousDay.diesel_liters) * 100
    : 0;

  return (
    <Paper elevation={3} sx={cardStyle}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 4,
            color: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(0,0,0,0.9)',
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <BoltIcon sx={{ color: CHART_COLORS.electricity }} />
          Energy Consumption
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={metricCardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BoltIcon sx={{ color: CHART_COLORS.electricity }} />
                <Typography variant="body2" color="text.secondary">
                  Total Electricity
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ color: CHART_COLORS.electricity }}>
                {formatNumber(summary.total_electricity_kwh)} kWh
                <TrendIndicator value={summary.trend_electricity} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily change: {electricityChange.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={metricCardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalGasStationIcon sx={{ color: CHART_COLORS.diesel }} />
                <Typography variant="body2" color="text.secondary">
                  Total Diesel
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ color: CHART_COLORS.diesel }}>
                {formatNumber(summary.total_diesel_liters)} L
                <TrendIndicator value={summary.trend_diesel} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily change: {dieselChange.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={metricCardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BoltIcon sx={{ color: CHART_COLORS.electricity }} />
                <Typography variant="body2" color="text.secondary">
                  Daily Avg. Electricity
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ color: CHART_COLORS.electricity }}>
                {formatNumber(summary.avg_electricity_kwh)} kWh
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cost: ${formatNumber(summary.avg_electricity_cost)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={metricCardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoneyIcon sx={{ color: CHART_COLORS.cost }} />
                <Typography variant="body2" color="text.secondary">
                  Total Cost
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ color: CHART_COLORS.cost }}>
                ${formatNumber(summary.total_cost)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily Avg: ${formatNumber(summary.avg_total_cost)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={chartContainerStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)'
                } 
              />
              <XAxis 
                dataKey="date" 
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary }}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="electricity_kwh"
                name="Electricity (kWh)"
                stroke={CHART_COLORS.electricity}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="diesel_liters"
                name="Diesel (L)"
                stroke={CHART_COLORS.diesel}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="total_cost"
                name="Total Cost ($)"
                stroke={CHART_COLORS.cost}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};
