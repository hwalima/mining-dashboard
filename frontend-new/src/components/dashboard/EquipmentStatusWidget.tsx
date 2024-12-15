import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Equipment {
  id: number;
  name: string;
  status: 'Operational' | 'Maintenance' | 'Down';
}

interface EquipmentStatusWidgetProps {
  equipment: Equipment[];
}

const COLORS = {
  Operational: '#4caf50',
  Maintenance: '#ff9800',
  Down: '#f44336',
};

const EquipmentStatusWidget: React.FC<EquipmentStatusWidgetProps> = ({
  equipment,
}) => {
  const getStatusCount = () => {
    const count = {
      Operational: 0,
      Maintenance: 0,
      Down: 0,
    };
    equipment.forEach((eq) => {
      count[eq.status]++;
    });
    return Object.entries(count).map(([name, value]) => ({ name, value }));
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Equipment Status
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={7}>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getStatusCount()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {getStatusCount().map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[entry.name as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          <Grid item xs={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(COLORS).map(([status, color]) => (
                <Chip
                  key={status}
                  label={`${status}: ${
                    equipment.filter((eq) => eq.status === status).length
                  }`}
                  sx={{
                    backgroundColor: color,
                    color: 'white',
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EquipmentStatusWidget;
