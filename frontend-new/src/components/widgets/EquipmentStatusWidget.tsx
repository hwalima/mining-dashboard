import React from 'react';
import { Paper, Typography, Box, Grid, CircularProgress, Chip, useTheme, Alert } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import BuildIcon from '@mui/icons-material/Build';
import ConstructionIcon from '@mui/icons-material/Construction';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { formatNumber, format } from '../../utils/formatters';

interface Equipment {
  id: number;
  name: string;
  type: string;
  status: string;
  efficiency: number;
  nextMaintenanceDate: string | null;
}

interface EquipmentSummary {
  total: number;
  operational: number;
  maintenance: number;
  outOfService: number;
  averageEfficiency: number;
}

interface EquipmentStatusWidgetProps {
  data?: {
    data: Equipment[];
    summary: EquipmentSummary;
  };
  loading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'operational':
      return 'success';
    case 'under maintenance':
      return 'warning';
    case 'out of service':
      return 'error';
    default:
      return 'default';
  }
};

const EquipmentStatusWidget: React.FC<EquipmentStatusWidgetProps> = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          bgcolor: 'background.paper',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07))',
          height: '100%',
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper 
        elevation={3}
        sx={{ 
          bgcolor: 'background.paper',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07))',
          height: '100%',
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body2">No equipment data available</Typography>
        </Box>
      </Paper>
    );
  }

  const { summary } = data;

  const pieData = [
    { name: 'Operational', value: summary.operational },
    { name: 'Under Maintenance', value: summary.maintenance },
    { name: 'Out of Service', value: summary.outOfService }
  ];

  const COLORS = {
    Operational: '#4CAF50',
    'Under Maintenance': '#FFA726',
    'Out of Service': '#EF5350'
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        bgcolor: 'background.paper',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07))',
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Equipment Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Equipment status and efficiency for This Week
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2,
                  bgcolor: 'background.paper',
                  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Average Efficiency
                </Typography>
                <Typography variant="h4" sx={{ my: 1 }}>
                  {summary.averageEfficiency}%
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: 'text.secondary'
                    }}
                    aria-label={`Change: 0.0% No significant change`}
                  >
                    <TrendingFlatIcon sx={{ fontSize: '1.25rem' }} />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={1}>
                {[
                  { label: 'Operational', value: summary.operational, color: COLORS.Operational },
                  { label: 'Under Maintenance', value: summary.maintenance, color: COLORS['Under Maintenance'] },
                  { label: 'Out of Service', value: summary.outOfService, color: COLORS['Out of Service'] }
                ].map((item) => (
                  <Grid item xs={12} key={item.label}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 1,
                        bgcolor: item.color,
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))'
                      }}
                    >
                      <Typography variant="h6">
                        {item.value} {item.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ 
          height: 300,
          mt: 2,
          flex: 1
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={52.5}
                outerRadius={90}
                fill="#8884d8"
                stroke="#fff"
                dataKey="value"
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export default EquipmentStatusWidget;
