import React from 'react';
import { Paper, Typography, Box, Grid, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../../utils/formatters';
import { widgetCardStyle, widgetContentStyle, widgetChartStyle } from '../../styles/widgetStyles';

interface EnvironmentalMetric {
  date: string;
  dust_level: number;
  noise_level: number;
  water_usage: number;
  rehabilitation_area: number;
  waste_water_ph: number;
}

interface EnvironmentalSummary {
  avg_dust: number;
  avg_noise: number;
  avg_water_usage: number;
  total_rehabilitation: number;
  avg_ph: number;
  total_water: number;
}

interface EnvironmentalWidgetProps {
  data: EnvironmentalMetric[];
  summary: EnvironmentalSummary;
  loading?: boolean;
}

const EnvironmentalWidget: React.FC<EnvironmentalWidgetProps> = ({ 
  data = [], 
  summary = {
    avg_dust: 0,
    avg_noise: 0,
    avg_water_usage: 0,
    total_rehabilitation: 0,
    avg_ph: 0,
    total_water: 0
  },
  loading = false
}) => {
  if (loading) {
    return (
      <Paper elevation={2} sx={widgetCardStyle}>
        <Box sx={widgetContentStyle}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={widgetCardStyle}>
      <Box sx={widgetContentStyle}>
        <Typography variant="h6" component="h2">
          Environmental Metrics
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Average Dust Level
            </Typography>
            <Typography variant="h6">
              {formatNumber(summary.avg_dust)} µg/m³
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Average Noise Level
            </Typography>
            <Typography variant="h6">
              {formatNumber(summary.avg_noise)} dB
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Water Usage
            </Typography>
            <Typography variant="h6">
              {formatNumber(summary.total_water)} m³
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Average pH Level
            </Typography>
            <Typography variant="h6">
              {formatNumber(summary.avg_ph)}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={widgetChartStyle}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="dust_level" 
                stroke="#8884d8" 
                name="Dust Level"
              />
              <Line 
                type="monotone" 
                dataKey="noise_level" 
                stroke="#82ca9d" 
                name="Noise Level"
              />
              <Line 
                type="monotone" 
                dataKey="waste_water_ph" 
                stroke="#ffc658" 
                name="pH Level"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export { EnvironmentalWidget };
