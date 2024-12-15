import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import { formatNumber, formatCurrency } from '../../utils/formatters';
import { useChemicalsData } from '../../hooks/useChemicalsData';
import ScienceIcon from '@mui/icons-material/Science';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';

const ChemicalsWidget: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useChemicalsData();

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
      background: 'linear-gradient(90deg, #00BCD4, #2196F3)',
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

  if (isLoading) {
    return (
      <Paper elevation={3} sx={cardStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={cardStyle}>
        <Alert severity="error" sx={{ 
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main 
        }}>
          Error loading chemicals data. Please try again later.
        </Alert>
      </Paper>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Paper elevation={3} sx={cardStyle}>
        <Alert severity="info" sx={{ 
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main 
        }}>
          No chemicals data available for the selected date range. Please try a different date range.
        </Alert>
      </Paper>
    );
  }

  const { summary } = data;

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
          <ScienceIcon sx={{ color: theme.palette.primary.main }} />
          Chemicals Usage
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box sx={metricCardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ScienceIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="body2" color="text.secondary">
                  Total Chemicals
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ color: theme.palette.primary.main }}>
                {summary.total_chemicals}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={metricCardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningIcon sx={{ color: theme.palette.warning.main }} />
                <Typography variant="body2" color="text.secondary">
                  Low Stock Items
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ color: theme.palette.warning.main }}>
                {summary.low_stock_count}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={metricCardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body2" color="text.secondary">
                  Warning Stock
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ color: theme.palette.success.main }}>
                {summary.warning_stock_count}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={metricCardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalAtmIcon sx={{ color: theme.palette.info.main }} />
                <Typography variant="body2" color="text.secondary">
                  Total Value Used
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ color: theme.palette.info.main }}>
                {formatCurrency(summary.total_value_used)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Recent Chemical Usage
          </Typography>
          <List>
            {data.data.slice(0, 5).map((item, index) => (
              <ListItem key={index} sx={{ px: 2, py: 1 }}>
                <ListItemText
                  primary={item.name}
                  secondary={`${formatNumber(item.amount_used)} ${item.unit} used - ${formatCurrency(item.value_used)}`}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500,
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Paper>
  );
};

export { ChemicalsWidget };
