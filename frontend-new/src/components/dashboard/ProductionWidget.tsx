import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductionData {
  date: string;
  production: number;
}

interface ProductionWidgetProps {
  data: ProductionData[];
  dailyTarget: number;
  currentProduction: number;
}

const ProductionWidget: React.FC<ProductionWidgetProps> = ({
  data,
  dailyTarget,
  currentProduction,
}) => {
  const progress = (currentProduction / dailyTarget) * 100;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Gold Production
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Daily Progress ({currentProduction.toFixed(2)} oz / {dailyTarget} oz)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 1, mb: 1 }}
          />
        </Box>

        <Box sx={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="production" fill="#ffd700" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductionWidget;
