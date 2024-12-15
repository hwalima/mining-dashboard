import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Grid, Alert, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber, formatCurrency } from '../../utils/formatters';
import { useExplosivesData } from '../../hooks/useExplosivesData';
import WarningIcon from '@mui/icons-material/Warning';
import { alpha } from '@mui/material/styles';
import { useDateFilterContext } from '../../contexts/DateFilterContext';

const ExplosivesWidget: React.FC = () => {
  const theme = useTheme();
  const { dateRange } = useDateFilterContext();
  const { data, isLoading, error } = useExplosivesData();

  const cardStyle = {
    borderRadius: '12px',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, #2A2D3E, #1F1F1F)'
      : theme.palette.background.paper,
    p: 2,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(64,64,64,.4)'
        : '0 8px 16px -8px rgba(0,0,0,0.3)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #FF4B4B, #FF9800)',
    }
  };

  const metricCardStyle = {
    p: 1.5,
    borderRadius: '8px',
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
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }
  };

  if (isLoading) {
    return (
      <Card sx={cardStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress sx={{ color: '#FF4B4B' }} />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={cardStyle}>
        <Alert severity="error" sx={{ 
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main 
        }}>
          Error loading explosives data
        </Alert>
      </Card>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card sx={cardStyle}>
        <Alert severity="info" sx={{ 
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main 
        }}>
          No explosives data available
        </Alert>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = [...data.data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending
    .reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = {
          date,
          total_amount: 0,
          effectiveness: 0,
          count: 0
        };
      }
      acc[date].total_amount += curr.amount_used;
      acc[date].effectiveness += curr.effectiveness_rating || 0;
      acc[date].count++;
      acc[date][curr.explosive_name] = curr.amount_used;
      return acc;
    }, {} as Record<string, any>);

  // Convert to array and take last 7 days
  const formattedChartData = Object.values(chartData)
    .map(day => ({
      ...day,
      effectiveness: day.effectiveness / day.count // Average effectiveness
    }))
    .slice(-7);

  // Get unique explosive names for the chart
  const uniqueExplosives = Array.from(new Set(data.data.map(item => item.explosive_name)));

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem' }}>
          Explosives Inventory & Usage
        </Typography>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={metricCardStyle}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Total Types</Typography>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{data.summary.total_explosives}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={metricCardStyle}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Low Stock</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{data.summary.low_stock_count}</Typography>
                {data.summary.low_stock_count > 0 && (
                  <WarningIcon sx={{ color: theme.palette.error.main, fontSize: '1rem' }} />
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={metricCardStyle}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Warning Stock</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{data.summary.warning_stock_count}</Typography>
                {data.summary.warning_stock_count > 0 && (
                  <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: '1rem' }} />
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={metricCardStyle}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Effectiveness</Typography>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                {formatNumber(data.summary.avg_effectiveness_rating)}%
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
            Current Inventory
          </Typography>
          <Grid container spacing={1.5}>
            {data.inventory.map((item) => (
              <Grid item xs={6} sm={6} md={3} key={item.id}>
                <Box sx={{
                  ...metricCardStyle,
                  borderLeft: `3px solid ${
                    item.status === 'Low' ? theme.palette.error.main :
                    item.status === 'Warning' ? theme.palette.warning.main :
                    theme.palette.success.main
                  }`,
                  py: 1
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{item.name}</Typography>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                    {formatNumber(item.current_stock)} {item.unit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Min. Required: {formatNumber(item.minimum_required)} {item.unit}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
          Usage History (Last 7 Days)
        </Typography>
        <Box sx={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date"
                fontSize={12}
                tick={{ fill: theme.palette.text.secondary }}
              />
              <YAxis
                fontSize={12}
                tick={{ fill: theme.palette.text.secondary }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '4px'
                }}
              />
              {uniqueExplosives.map((explosive, index) => (
                <Bar
                  key={explosive}
                  dataKey={explosive}
                  name={explosive}
                  fill={`hsl(${index * 60}, 70%, 50%)`}
                  stackId="usage"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export { ExplosivesWidget };
