import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDateFilterContext } from '../../contexts/DateFilterContext';
import FilterListIcon from '@mui/icons-material/FilterList';
import { format } from 'date-fns';

const DateFilter: React.FC = () => {
  const { dateRange, dateRangeType, setDateRange, setDateRangeType } = useDateFilterContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRangeSelect = (type: typeof dateRangeType) => {
    if (type === 'custom') {
      setCustomDialogOpen(true);
    } else {
      setDateRangeType(type);
    }
    handleClose();
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      setDateRangeType('custom');
      setDateRange({
        startDate: customStartDate,
        endDate: customEndDate
      });
      setCustomDialogOpen(false);
    }
  };

  const formatDateRange = () => {
    const start = format(dateRange.startDate, 'MMM dd, yyyy');
    const end = format(dateRange.endDate, 'MMM dd, yyyy');
    return `${start} - ${end}`;
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClick}
          startIcon={<FilterListIcon />}
          size="small"
        >
          {formatDateRange()}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleRangeSelect('today')}>Today</MenuItem>
          <MenuItem onClick={() => handleRangeSelect('week')}>This Week</MenuItem>
          <MenuItem onClick={() => handleRangeSelect('month')}>This Month</MenuItem>
          <MenuItem onClick={() => handleRangeSelect('7days')}>Last 7 Days</MenuItem>
          <MenuItem onClick={() => handleRangeSelect('30days')}>Last 30 Days</MenuItem>
          <MenuItem onClick={() => handleRangeSelect('custom')}>Custom Range...</MenuItem>
        </Menu>
      </Box>

      <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)}>
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <DatePicker
                label="Start Date"
                value={customStartDate}
                onChange={(newValue) => setCustomStartDate(newValue)}
              />
              <DatePicker
                label="End Date"
                value={customEndDate}
                onChange={(newValue) => setCustomEndDate(newValue)}
                minDate={customStartDate || undefined}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCustomDateSubmit}
            disabled={!customStartDate || !customEndDate}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DateFilter;
