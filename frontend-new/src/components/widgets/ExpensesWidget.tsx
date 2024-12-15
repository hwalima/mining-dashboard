import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { widgetCardStyle, widgetContentStyle, widgetChartStyle } from '../../styles/widgetStyles';
import { formatCurrency } from '../../utils/formatters';

interface ExpensesWidgetProps {
  data: {
    date: string;
    category: string;
    amount: number;
    description: string;
  }[];
  summary: {
    total: number;
    by_category: Record<string, number>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ExpensesWidget: React.FC<ExpensesWidgetProps> = ({ 
  data = [], 
  summary = {
    total: 0,
    by_category: {}
  }
}) => {
  const pieData = Object.entries(summary.by_category).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  return (
    <Paper elevation={2} sx={widgetCardStyle}>
      <Box sx={widgetContentStyle}>
        <Typography variant="h6" component="h2">
          Expenses Overview
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 1 }}>
              {formatCurrency(summary.total)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Total Expenses
            </Typography>
          </Grid>
        </Grid>

        <Box sx={widgetChartStyle}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export { ExpensesWidget };
