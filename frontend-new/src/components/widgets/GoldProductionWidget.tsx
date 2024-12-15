import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  Fade,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import { formatNumber } from '../../utils/formatters';
import TrendIndicator from '../common/TrendIndicator';
import { useGoldProductionData } from '../../hooks/useGoldProductionData';
import { alpha } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { format, differenceInDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecyclingIcon from '@mui/icons-material/Recycling';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DiamondIcon from '@mui/icons-material/Diamond';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useDateFilterContext } from '../../contexts/DateFilterContext';

const GoldProductionWidget: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useGoldProductionData();
  const { dateRange } = useDateFilterContext();
  const daysDifference = differenceInDays(dateRange.endDate, dateRange.startDate);

  // Filter data based on date range
  const filteredData = React.useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(item => 
      isWithinInterval(new Date(item.date), {
        start: dateRange.startDate,
        end: dateRange.endDate
      })
    ).slice().reverse();
  }, [data, dateRange]);

  const formatDate = (date: string) => {
    if (daysDifference <= 31) {
      return format(new Date(date), 'MMM d');
    } else {
      const itemDate = new Date(date);
      const weekStart = startOfWeek(itemDate);
      const weekEnd = endOfWeek(itemDate);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
    }
  };

  const glassEffect = {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(25,25,25,0.9) 0%, rgba(15,15,15,0.8) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.1)' 
      : 'rgba(0,0,0,0.1)'}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0,0,0,0.2)'
      : '0 8px 32px rgba(31,38,135,0.15)',
  };

  const metricCardStyle = {
    ...glassEffect,
    p: { xs: 2, sm: 3 },
    minHeight: { xs: '100px', sm: '120px' },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
        `linear-gradient(90deg, ${props.color || '#FFD700'}, ${alpha(props.color || '#FFD700', 0.3)})`,
    }
  };

  const chartStyle = {
    ...glassEffect,
    p: 3,
    mt: { xs: 2, sm: 3 },
    position: 'relative',
    width: '100%'
  };

  const formatMetricValue = (value: number, metric: string) => {
    if (metric.toLowerCase().includes('rate') || metric.toLowerCase().includes('efficiency')) {
      return `${Number(value).toFixed(2)}%`;
    } else if (metric.toLowerCase().includes('tonnage')) {
      return `${Number(value).toFixed(2)} t`;
    } else if (metric.toLowerCase().includes('smelted')) {
      return `${Number(value).toFixed(2)} kg`;
    } else if (metric.toLowerCase().includes('profit')) {
      return `$${Number(value).toFixed(2)}`;
    } else if (metric.toLowerCase().includes('price')) {
      return `$${Number(value).toFixed(2)}/g`;
    }
    return Number(value).toFixed(2);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          ...glassEffect,
          p: 2,
          minWidth: 200,
        }}>
          <Typography variant="subtitle2" color="textSecondary">
            {label}
          </Typography>
          {payload.map((entry: any) => (
            <Box key={entry.name} sx={{ mt: 1 }}>
              <Typography variant="body2" color={entry.color}>
                {entry.name}: {formatMetricValue(entry.value, entry.name)}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        width: '100%',
        ...glassEffect,
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DiamondIcon sx={{ color: theme.palette.primary.main }} />
            Gold Production Overview
          </Typography>
          <Tooltip title="Overview of gold production metrics including operational efficiency, recovery rate, and production trends">
            <IconButton size="small">
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : data ? (
          <>
            <Grid container spacing={2} sx={{ mb: 3, width: '100%', margin: 0 }}>
              <Grid item xs={12} sm={2.4}>
                <Card sx={metricCardStyle}>
                  <CardContent sx={{
                    flexGrow: 1,
                    padding: theme.spacing(2),
                  }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon color="primary" />
                      <Typography variant="subtitle1">Operational Efficiency</Typography>
                    </Box>
                    <Typography variant="h6">{formatMetricValue(data.summary.avg_efficiency, 'efficiency')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={2.4}>
                <Card sx={metricCardStyle}>
                  <CardContent sx={{
                    flexGrow: 1,
                    padding: theme.spacing(2),
                  }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <RecyclingIcon color="primary" />
                      <Typography variant="subtitle1">Recovery Rate</Typography>
                    </Box>
                    <Typography variant="h6">{formatMetricValue(data.summary.avg_recovery_rate, 'rate')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={2.4}>
                <Card sx={metricCardStyle}>
                  <CardContent sx={{
                    flexGrow: 1,
                    padding: theme.spacing(2),
                  }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AttachMoneyIcon color="primary" />
                      <Typography variant="subtitle1">Gold Price</Typography>
                    </Box>
                    <Typography variant="h6">{formatMetricValue(data.summary.avg_gold_price, 'price')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={2.4}>
                <Card sx={metricCardStyle}>
                  <CardContent sx={{
                    flexGrow: 1,
                    padding: theme.spacing(2),
                  }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DiamondIcon color="primary" />
                      <Typography variant="subtitle1">Total Smelted Gold</Typography>
                    </Box>
                    <Typography variant="h6">{formatMetricValue(data.summary.total_smelted_gold, 'smelted')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={2.4}>
                <Card sx={metricCardStyle}>
                  <CardContent sx={{
                    flexGrow: 1,
                    padding: theme.spacing(2),
                  }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MonetizationOnIcon color="primary" />
                      <Typography variant="subtitle1">Total Gross Profit</Typography>
                    </Box>
                    <Typography variant="h6">{formatMetricValue(data.summary.total_gross_profit, 'profit')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Box sx={chartStyle}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                    Gold Production Trends
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fill: theme.palette.text.secondary }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        yAxisId="left"
                        tick={{ fill: theme.palette.text.secondary }}
                        label={{ 
                          value: 'Gold (kg)', 
                          angle: -90, 
                          position: 'insideLeft',
                          fill: theme.palette.text.secondary 
                        }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: theme.palette.text.secondary }}
                        label={{ 
                          value: 'Rate (%)', 
                          angle: 90, 
                          position: 'insideRight',
                          fill: theme.palette.text.secondary 
                        }}
                      />
                      <ChartTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        stroke="#FFD700"
                        dataKey="smelted_gold"
                        name="Smelted Gold"
                        fill={alpha('#FFD700', 0.2)}
                        yAxisId="left"
                      />
                      <Line
                        type="monotone"
                        dataKey="gold_recovery_rate"
                        name="Recovery Rate"
                        stroke="#4CAF50"
                        yAxisId="right"
                      />
                      <Line
                        type="monotone"
                        dataKey="operational_efficiency"
                        name="Operational Efficiency"
                        stroke="#2196F3"
                        yAxisId="right"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={chartStyle}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                    Mining Tonnage Metrics
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fill: theme.palette.text.secondary }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fill: theme.palette.text.secondary }}
                        label={{ 
                          value: 'Tonnage (t)', 
                          angle: -90, 
                          position: 'insideLeft',
                          fill: theme.palette.text.secondary 
                        }}
                      />
                      <ChartTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total_tonnage_crushed"
                        name="Crushed"
                        stroke="#FF9800"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_tonnage_hoisted"
                        name="Hoisted"
                        stroke="#E91E63"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_tonnage_milled"
                        name="Milled"
                        stroke="#9C27B0"
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </>
        ) : null}
      </Box>
    </Paper>
  );
};

export { GoldProductionWidget };
