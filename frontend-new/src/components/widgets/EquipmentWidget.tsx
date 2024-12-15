import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import TrendIndicator from '../common/TrendIndicator';
import { formatNumber } from '../../utils/formatters';
import { widgetCardStyle, widgetContentStyle } from '../../styles/widgetStyles';
import { useEquipmentData } from '../../hooks/useEquipmentData';
import { useDateFilterContext } from '../../contexts/DateFilterContext';
import { format } from 'date-fns';

const STATUS_COLORS = {
  'Operational': '#4CAF50',
  'Under Maintenance': '#FFA726',
  'Out of Service': '#EF5350',
} as const;

const EquipmentWidget: React.FC = () => {
  const { data, isLoading, error } = useEquipmentData();
  const { dateRange, dateRangeType } = useDateFilterContext();

  const getDateRangeText = () => {
    if (dateRangeType === 'today') return 'Today';
    if (dateRangeType === 'week') return 'This Week';
    if (dateRangeType === 'month') return 'This Month';
    if (dateRangeType === '7days') return 'Last 7 Days';
    if (dateRangeType === '30days') return 'Last 30 Days';
    return `${format(dateRange.startDate, 'MMM d')} - ${format(dateRange.endDate, 'MMM d')}`;
  };

  // Group equipment by status and prepare pie data
  const { equipmentByStatus, pieData } = React.useMemo(() => {
    if (!data?.data) {
      console.log('No equipment data available');
      return { equipmentByStatus: {}, pieData: [] };
    }

    // Group equipment by status and filter by date range
    const grouped = data.data.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = [];
      }
      acc[item.status].push({
        ...item,
        hasRecentMaintenance: item.maintenance_history && item.maintenance_history.length > 0,
        lastMaintenanceInPeriod: item.maintenance_history?.length > 0 ? 
          item.maintenance_history[0].date : null
      });
      return acc;
    }, {} as Record<string, Array<typeof data.data[0] & { 
      hasRecentMaintenance: boolean;
      lastMaintenanceInPeriod: string | null;
    }>>);

    // Calculate counts from actual data instead of using summary
    const operationalCount = (grouped['Operational'] || []).length;
    const maintenanceCount = (grouped['Under Maintenance'] || []).length;
    const outOfServiceCount = (grouped['Out of Service'] || []).length;

    // Create pie data from calculated counts
    const pie = [
      { name: 'Operational', value: operationalCount },
      { name: 'Under Maintenance', value: maintenanceCount },
      { name: 'Out of Service', value: outOfServiceCount }
    ];

    return { equipmentByStatus: grouped, pieData: pie };
  }, [data, dateRange]);

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;

    const status = payload[0].name;
    const equipmentList = equipmentByStatus[status] || [];

    return (
      <Box sx={{ 
        bgcolor: 'background.paper',
        p: 1.5,
        borderRadius: 1,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        border: '1px solid rgba(0,0,0,0.1)',
        maxWidth: 300,
        maxHeight: 400,
        overflowY: 'auto'
      }}>
        <Typography variant="subtitle2" sx={{ 
          mb: 1, 
          color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{status} Equipment</span>
          <span>({equipmentList.length})</span>
        </Typography>
        <Box component="ul" sx={{ m: 0, p: 0, pl: 2, listStyle: 'none' }}>
          {equipmentList.map((eq) => (
            <Box component="li" key={eq.id} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {eq.name} ({eq.type})
              </Typography>
              {status === 'Operational' && eq.efficiency !== undefined && (
                <Typography variant="body2" color="text.secondary">
                  Efficiency: {eq.efficiency.toFixed(1)}%
                </Typography>
              )}
              {status === 'Under Maintenance' && (
                <>
                  {eq.next_maintenance_due && (
                    <Typography variant="body2" color="text.secondary">
                      Due: {format(new Date(eq.next_maintenance_due), 'MMM d, yyyy')}
                    </Typography>
                  )}
                  {eq.hasRecentMaintenance && eq.lastMaintenanceInPeriod && (
                    <Typography variant="body2" color="text.secondary">
                      Last Service: {format(new Date(eq.lastMaintenanceInPeriod), 'MMM d, yyyy')}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Paper elevation={2} sx={widgetCardStyle}>
        <Box sx={widgetContentStyle}>
          <Typography variant="h6" component="h2">
            Equipment Status
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={widgetCardStyle}>
        <Box sx={widgetContentStyle}>
          <Typography variant="h6" component="h2">
            Equipment Status
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error instanceof Error ? error.message : 'Failed to load equipment data'}
          </Alert>
        </Box>
      </Paper>
    );
  }

  if (!data?.summary) {
    return (
      <Paper elevation={2} sx={widgetCardStyle}>
        <Box sx={widgetContentStyle}>
          <Typography variant="h6" component="h2">
            Equipment Status
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            No equipment data available for the selected period
          </Alert>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={widgetCardStyle}>
      <Box sx={widgetContentStyle}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2">
            Equipment Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Equipment status and efficiency for {getDateRangeText()}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Average Efficiency
                  </Typography>
                  <Typography variant="h4" sx={{ my: 0.5 }}>
                    {formatNumber(data.summary.avg_efficiency)}%
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <TrendIndicator 
                      value={data.summary.trend_efficiency} 
                      format={(v) => `${v > 0 ? '+' : ''}${formatNumber(v)}%`}
                      lightMode
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        bgcolor: 'background.default',
                        color: STATUS_COLORS['Operational'],
                      }}
                    >
                      <Typography variant="h6">
                        {pieData.find((item) => item.name === 'Operational').value} Operational
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        bgcolor: 'background.default',
                        color: STATUS_COLORS['Under Maintenance'],
                      }}
                    >
                      <Typography variant="h6">
                        {pieData.find((item) => item.name === 'Under Maintenance').value} Under Maintenance
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        bgcolor: 'background.default',
                        color: STATUS_COLORS['Out of Service'],
                      }}
                    >
                      <Typography variant="h6">
                        {pieData.find((item) => item.name === 'Out of Service').value} Out of Service
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="60%"
                labelLine={false}
                label={({ name, value, percent }) => {
                  if (percent === 0) return null;
                  const shortName = name === 'Under Maintenance' ? 'Maintenance' : 
                                  name === 'Out of Service' ? 'Out of Svc' : name;
                  return `${shortName}: ${value} (${(percent * 100).toFixed(0)}%)`;
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export { EquipmentWidget };
