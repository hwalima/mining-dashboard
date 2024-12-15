import React, { useEffect, useState } from 'react';
import { Grid, Box, CircularProgress, IconButton, Tooltip, Paper } from '@mui/material';
import { useDashboard } from '../contexts/DashboardContext';
import { dashboardService } from '../services/api';
import { useDateFilterContext } from '../contexts/DateFilterContext';
import DateFilter from '../components/common/DateFilter';
import { SafetyWidget } from '../components/widgets/SafetyWidget';
import { ChemicalsWidget } from '../components/widgets/ChemicalsWidget';
import { ExplosivesWidget } from '../components/widgets/ExplosivesWidget';
import { ExpensesWidget } from '../components/widgets/ExpensesWidget';
import { LaborWidget } from '../components/widgets/LaborWidget';
import { EnvironmentalWidget } from '../components/widgets/EnvironmentalWidget';
import { EnergyWidget } from '../components/widgets/EnergyWidget';
import { EquipmentWidget } from '../components/widgets/EquipmentWidget';
import CustomizeDialog from '../components/dialogs/CustomizeDialog';
import Layout from '../components/layout/Layout';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DashboardData } from '../services/api';
import { format } from 'date-fns';
import { GoldProductionWidget } from '../components/widgets/GoldProductionWidget';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const { widgets, updateWidgets } = useDashboard();
  const { dateRange } = useDateFilterContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all dashboard data
        const response = await dashboardService.getDashboardData({
          from_date: format(dateRange.startDate, 'yyyy-MM-dd'),
          to_date: format(dateRange.endDate, 'yyyy-MM-dd')
        });

        // Fetch safety data separately
        const safetyResponse = await dashboardService.getSafetyData({
          from_date: format(dateRange.startDate, 'yyyy-MM-dd'),
          to_date: format(dateRange.endDate, 'yyyy-MM-dd')
        });
        
        // Merge safety data into dashboard data
        setDashboardData({
          ...response,
          safety: safetyResponse
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const handleSaveWidgets = (updatedWidgets: typeof widgets) => {
    updateWidgets(updatedWidgets);
  };

  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          {error}
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DateFilter />
        <Tooltip title="Customize Dashboard">
          <IconButton onClick={() => setCustomizeOpen(true)} size="small">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <CustomizeDialog
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        widgets={widgets}
        onSave={handleSaveWidgets}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : dashboardData ? (
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {/* First Row - Gold Production (100% width) */}
          <Grid item xs={12} sx={{ 
            width: '100%',
            '& > div': { 
              width: '100%',
              '& > div': {
                width: '100%'
              }
            } 
          }}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <GoldProductionWidget />
            </Box>
          </Grid>

          {/* Second Row - Energy (100% width) */}
          <Grid item xs={12}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <EnergyWidget data={dashboardData.energy} loading={loading} />
            </Box>
          </Grid>

          {/* Third Row - Safety Overview, Chemical Usage (50% each) */}
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <SafetyWidget data={dashboardData.safety} loading={loading} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <ChemicalsWidget data={dashboardData.chemicals} loading={loading} />
            </Box>
          </Grid>

          {/* Fourth Row - Remaining Widgets (2 columns on medium, 3 columns on large) */}
          <Grid item xs={12} md={6} lg={4}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <EquipmentWidget />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <ExplosivesWidget data={dashboardData.explosives} loading={loading} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <ExpensesWidget data={dashboardData.expenses} loading={loading} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <LaborWidget data={dashboardData.labor} loading={loading} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <EnvironmentalWidget data={dashboardData.environmental} loading={loading} />
            </Box>
          </Grid>
        </Grid>
      ) : null}
    </Layout>
  );
};

export default Dashboard;
