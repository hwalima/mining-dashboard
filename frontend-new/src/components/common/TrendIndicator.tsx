import React from 'react';
import { Box, Tooltip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface TrendIndicatorProps {
  value: number;
  threshold?: number;
  tooltipPrefix?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ 
  value, 
  threshold = 0.1, 
  tooltipPrefix = 'Change' 
}) => {
  const getIcon = () => {
    if (Math.abs(value) <= threshold) {
      return {
        icon: <TrendingFlatIcon sx={{ fontSize: 'inherit' }} />,
        color: 'text.secondary',
        label: 'No significant change'
      };
    }
    if (value > threshold) {
      return {
        icon: <TrendingUpIcon sx={{ fontSize: 'inherit' }} />,
        color: 'success.main',
        label: 'Increase'
      };
    }
    return {
      icon: <TrendingDownIcon sx={{ fontSize: 'inherit' }} />,
      color: 'error.main',
      label: 'Decrease'
    };
  };

  const { icon, color, label } = getIcon();
  const formattedValue = Math.abs(value).toFixed(2);
  const tooltipText = `${tooltipPrefix}: ${formattedValue}% ${label}`;

  return (
    <Tooltip title={tooltipText}>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          color,
          ml: 1,
          fontSize: '0.875rem'
        }}
      >
        {icon}
      </Box>
    </Tooltip>
  );
};

export default TrendIndicator;
