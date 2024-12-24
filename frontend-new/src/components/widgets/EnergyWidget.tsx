import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useEnergyData } from '../../hooks/useEnergyData';
import { formatNumber } from '../../utils/formatters';

const CHART_COLORS = {
  electricity: '#8884d8',
  diesel: '#82ca9d',
  cost: '#ffc658',
  gradient1: '#8884d8',
  gradient2: '#82ca9d',
};

export const EnergyWidget: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useEnergyData();

  const glassEffect = {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(40,40,40,0.9) 0%, rgba(20,20,20,0.8) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.1)' 
      : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '16px',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0,0,0,0.2)'
      : '0 8px 32px rgba(31,38,135,0.15)',
  };

  const metricCardStyle = {
    ...glassEffect,
    p: 2.5,
    height: '100%',
    display: 'relative',
    flexDirection: 'column',
    gap: 1,
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: (props: { color?: string }) =>
        `linear-gradient(90deg, ${props.color || CHART_COLORS.electricity}, ${alpha(props.color || CHART_COLORS.electricity, 0.3)})`,
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <Box
        sx={{
          ...glassEffect,
          p: 2,
          minWidth: 200,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary }}>
          {label}
        </Typography>
        {payload.map((entry: any) => (
          <Stack key={entry.dataKey} spacing={0.5} sx={{ mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: entry.color, fontWeight: 500 }}>
              {entry.name}:
              <span style={{ marginLeft: 8, fontWeight: 600 }}>
                {entry.name === 'Total Cost' 
                  ? `$${formatNumber(entry.value)}`
                  : `${formatNumber(entry.value)} ${entry.name === 'Electricity' ? 'kWh' : 'L'}`
                }
              </span>
            </Typography>
            {entry.name !== 'Total Cost' && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Cost: ${formatNumber(payload[0].payload[`${entry.dataKey}_cost`])}
              </Typography>
            )}
          </Stack>
        ))}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load energy usage data
      </Alert>
    );
  }

  const energyData = data?.data || [];
  const summary = data?.summary || {
    avg_electricity_kwh: 0,
    avg_electricity_cost: 0,
    avg_diesel_liters: 0,
    avg_diesel_cost: 0,
    avg_total_cost: 0,
    trend_electricity: 0,
    trend_diesel: 0,
    trend_cost: 0
  };

  const chartData = energyData.map((item) => {
    if (!item.date) {
      console.error('Missing date in item:', item);
      return null;
    }

    try {
      // Parse the date string from YYYY-MM-DD format
      const [year, month, day] = item.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', item.date);
        return null;
      }
      
      return {
        fullDate: item.date, // Keep the original date string for tooltip
        date: format(date, 'MMM dd, yyyy'), // Show full date in chart
        electricity_kwh: item.electricity_kwh,
        diesel_liters: item.diesel_liters,
        total_cost: item.total_cost,
      };
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }).filter(Boolean); // Remove any null entries

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Energy Usage
        </Typography>
        <Tooltip title="Shows electricity and diesel consumption trends">
          <IconButton size="small">
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {!isLoading && !error && data && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                ...metricCardStyle,
                color: CHART_COLORS.electricity,
                p: 1.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <BoltIcon fontSize="small" />
                <Typography variant="body1">Electricity Usage</Typography>
                <Tooltip title="Average electricity consumption for the selected period">
                  <IconButton size="small">
                    <InfoOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="h5" sx={{ mt: 1, mb: 0.5 }}>
                {formatNumber(summary.avg_electricity_kwh)} kWh
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cost: ${formatNumber(summary.avg_electricity_cost)}
                {summary.trend_electricity !== 0 && (
                  <Box component="span" sx={{ ml: 1, color: summary.trend_electricity > 0 ? 'error.main' : 'success.main' }}>
                    {summary.trend_electricity > 0 ? '+' : ''}{summary.trend_electricity.toFixed(1)}%
                  </Box>
                )}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                ...metricCardStyle,
                color: CHART_COLORS.diesel,
                p: 1.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalGasStationIcon fontSize="small" />
                <Typography variant="body1">Diesel Usage</Typography>
                <Tooltip title="Average diesel consumption for the selected period">
                  <IconButton size="small">
                    <InfoOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="h5" sx={{ mt: 1, mb: 0.5 }}>
                {formatNumber(summary.avg_diesel_liters)} L
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cost: ${formatNumber(summary.avg_diesel_cost)}
                {summary.trend_diesel !== 0 && (
                  <Box component="span" sx={{ ml: 1, color: summary.trend_diesel > 0 ? 'error.main' : 'success.main' }}>
                    {summary.trend_diesel > 0 ? '+' : ''}{summary.trend_diesel.toFixed(1)}%
                  </Box>
                )}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                ...metricCardStyle,
                color: CHART_COLORS.cost,
                p: 1.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <MonetizationOnIcon fontSize="small" />
                <Typography variant="body1">Total Cost</Typography>
                <Tooltip title="Average energy cost for the selected period">
                  <IconButton size="small">
                    <InfoOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="h5" sx={{ mt: 1, mb: 0.5 }}>
                ${formatNumber(summary.avg_total_cost)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.trend_cost !== 0 && (
                  <Box component="span" sx={{ color: summary.trend_cost > 0 ? 'error.main' : 'success.main' }}>
                    {summary.trend_cost > 0 ? '+' : ''}{summary.trend_cost.toFixed(1)}%
                  </Box>
                )}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ height: 280, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              yAxisId="usage"
              orientation="left"
              label={{ value: 'Usage', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="cost"
              orientation="right"
              label={{ value: 'Cost ($)', angle: 90, position: 'insideRight' }}
            />
            <RechartsTooltip content={CustomTooltip} />
            <Area
              yAxisId="usage"
              type="monotone"
              dataKey="electricity_kwh"
              name="Electricity"
              stroke={CHART_COLORS.electricity}
              fill={CHART_COLORS.electricity}
              fillOpacity={0.3}
            />
            <Area
              yAxisId="usage"
              type="monotone"
              dataKey="diesel_liters"
              name="Diesel"
              stroke={CHART_COLORS.diesel}
              fill={CHART_COLORS.diesel}
              fillOpacity={0.3}
            />
            <Area
              yAxisId="cost"
              type="monotone"
              dataKey="total_cost"
              name="Total Cost"
              stroke={CHART_COLORS.cost}
              fill={CHART_COLORS.cost}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default EnergyWidget;
