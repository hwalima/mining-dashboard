import React from 'react';
import { Paper, Typography, Box, Grid, CircularProgress, Alert, Card } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useTheme } from '@mui/material/styles';
import { useLaborData } from '../../hooks/useLaborData';
import { formatNumber } from '../../utils/formatters';
import { format } from 'date-fns';
import { useDateFilterContext } from '../../contexts/DateFilterContext';

const LaborWidget: React.FC = () => {
  const { data: laborData, isLoading, error } = useLaborData();
  const { dateRange } = useDateFilterContext();
  const theme = useTheme();
  
  const colors = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  };

  // Transform departments data into pie chart format
  const departmentDistribution = React.useMemo(() => {
    if (!laborData?.departments) return [];
    return laborData.departments.map(dept => ({
      name: dept.department__name,
      value: dept.worker_count
    }));
  }, [laborData?.departments]);

  const LoadingOverlay = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        backdropFilter: 'blur(4px)',
        zIndex: 1,
      }}
    >
      <CircularProgress />
    </Box>
  );

  if (error) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          height: '100%', 
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 4,
        }}
      >
        <Alert severity="error">Unable to load labor data</Alert>
      </Card>
    );
  }

  const { summary } = laborData || { summary: {
    total_workers: 0,
    avg_attendance: 0,
    avg_productivity: 0,
    total_incidents: 0,
    trend_attendance: 0,
    trend_productivity: 0,
    trend_incidents: 0,
  }};

  const MetricCard = ({ title, value, trend, trendValue, color }: {
    title: string;
    value: string | number;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: string;
  }) => (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: colors.background,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" color={color || 'text.primary'} sx={{ 
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1,
      }}>
        {value}
      </Typography>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto' }}>
          {trend === 'up' ? (
            <TrendingUpIcon sx={{ color: colors.success, fontSize: '1rem' }} />
          ) : (
            <TrendingDownIcon sx={{ color: colors.error, fontSize: '1rem' }} />
          )}
          <Typography 
            variant="caption" 
            color={trend === 'up' ? colors.success : colors.error}
            sx={{ fontWeight: 500 }}
          >
            {trendValue}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent * 100 > 5 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        p: 3, 
        bgcolor: 'background.paper',
        borderRadius: 4,
        position: 'relative',
      }}
    >
      {isLoading && <LoadingOverlay />}
      
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon sx={{ color: colors.primary }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Labor Metrics
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={3}>
          <MetricCard
            title="Total Workers"
            value={summary.total_workers}
            color={colors.primary}
          />
        </Grid>
        <Grid item xs={3}>
          <MetricCard
            title="Attendance Rate"
            value={`${summary.avg_attendance.toFixed(1)}%`}
            trend={summary.trend_attendance >= 0 ? "up" : "down"}
            trendValue={`${Math.abs(summary.trend_attendance)}%`}
            color={colors.info}
          />
        </Grid>
        <Grid item xs={3}>
          <MetricCard
            title="Productivity Rate"
            value={`${summary.avg_productivity.toFixed(1)}%`}
            trend={summary.trend_productivity >= 0 ? "up" : "down"}
            trendValue={`${Math.abs(summary.trend_productivity)}%`}
            color={colors.success}
          />
        </Grid>
        <Grid item xs={3}>
          <MetricCard
            title="Safety Incidents"
            value={summary.total_incidents}
            trend={summary.trend_incidents <= 0 ? "down" : "up"}
            trendValue={`${Math.abs(summary.trend_incidents)}%`}
            color={colors.error}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: colors.background,
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Workers by Department
        </Typography>
        {departmentDistribution.length > 0 ? (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="90%"
                  innerRadius="60%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {departmentDistribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[colors.primary, colors.info, colors.success, colors.warning, colors.error][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${value} workers`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box sx={{ 
            flex: 1,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography color="text.secondary">
              No department data available
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export { LaborWidget };
