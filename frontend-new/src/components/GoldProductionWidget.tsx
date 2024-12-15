import React from 'react';
import { useQuery } from 'react-query';
import { fetchGoldProduction } from '../services/api';
import { format, subDays } from 'date-fns';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const GoldProductionWidget: React.FC = () => {
  // Get data for the last 30 days
  const endDate = new Date();
  const startDate = subDays(endDate, 30);

  const { data, isLoading, error } = useQuery(
    ['goldProduction', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    () =>
      fetchGoldProduction({
        from_date: format(startDate, 'yyyy-MM-dd'),
        to_date: format(endDate, 'yyyy-MM-dd'),
      }),
    {
      refetchInterval: 300000, // Refetch every 5 minutes
      staleTime: 300000, // Consider data stale after 5 minutes
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Error loading gold production data. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">No gold production data available.</Alert>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Gold Production Overview
        </Typography>

        {/* Summary Statistics */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total Smelted Gold
              </Typography>
              <Typography variant="h6">
                {formatNumber(data.summary.total_smelted_gold)} g
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Recovery Rate
              </Typography>
              <Typography variant="h6">
                {formatNumber(data.summary.avg_recovery_rate)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Operational Efficiency
              </Typography>
              <Typography variant="h6">
                {formatNumber(data.summary.avg_efficiency)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total Gross Profit
              </Typography>
              <Typography variant="h6">
                ${formatNumber(data.summary.total_gross_profit)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Production Chart */}
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart
              data={data.data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                formatter={(value: number, name: string) => [
                  formatNumber(value),
                  name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                ]}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="smelted_gold"
                name="Smelted Gold (g)"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="gold_recovery_rate"
                name="Recovery Rate (%)"
                stroke="#82ca9d"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="operational_efficiency"
                name="Operational Efficiency (%)"
                stroke="#ffc658"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoldProductionWidget;
