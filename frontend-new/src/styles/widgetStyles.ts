import { SxProps, Theme } from '@mui/material';

export const widgetCardStyle: SxProps<Theme> = {
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: (theme) => theme.shadows[10],
    '&::after': {
      opacity: 1
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out'
  }
};

export const widgetContentStyle: SxProps<Theme> = {
  p: 2,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '& .MuiTypography-h6': {
    mb: 2,
    fontWeight: 'bold'
  }
};

export const widgetChartStyle: SxProps<Theme> = {
  flex: 1,
  minHeight: 200,
  width: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)'
  }
};
