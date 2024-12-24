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
        <Grid container spacing={2} sx={{ width: '100%', margin: 0 }}>
          {/* Gold Production - Full Width (Always on top) */}
          {widgets.find(w => w.id === 'gold-production')?.isVisible && (
            <Grid item xs={12}>
              <GoldProductionWidget data={dashboardData.production} loading={loading} />
            </Grid>
          )}

          {/* First Row - Energy and Safety */}
          <Grid container item spacing={2}>
            {widgets.find(w => w.id === 'energy')?.isVisible && (
              <Grid item xs={12} md={6}>
                <EnergyWidget data={dashboardData.energy} loading={loading} />
              </Grid>
            )}
            {widgets.find(w => w.id === 'safety')?.isVisible && (
              <Grid item xs={12} md={6}>
                <SafetyWidget data={dashboardData.safety} loading={loading} />
              </Grid>
            )}
          </Grid>

          {/* Second Row - Equipment, Chemicals, and Explosives */}
          <Grid container item spacing={2}>
            {widgets.find(w => w.id === 'chemicals')?.isVisible && (
              <Grid item xs={12} md={4}>
                <ChemicalsWidget data={dashboardData.chemicals} loading={loading} />
              </Grid>
            )}
            {widgets.find(w => w.id === 'explosives')?.isVisible && (
              <Grid item xs={12} md={4}>
                <ExplosivesWidget data={dashboardData.explosives} loading={loading} />
              </Grid>
            )}
          </Grid>

          {/* Third Row - Labor, Environmental, and Expenses */}
          <Grid container item spacing={2}>
            {widgets.find(w => w.id === 'labor')?.isVisible && (
              <Grid item xs={12} md={4}>
                <LaborWidget data={dashboardData.labor} loading={loading} />
              </Grid>
            )}
            {widgets.find(w => w.id === 'environmental')?.isVisible && (
              <Grid item xs={12} md={4}>
                <EnvironmentalWidget 
                  data={dashboardData.environmental?.data} 
                  summary={dashboardData.environmental?.summary} 
                  loading={loading} 
                />
              </Grid>
            )}
            {widgets.find(w => w.id === 'expenses')?.isVisible && (
              <Grid item xs={12} md={4}>
                <ExpensesWidget 
                  data={dashboardData.expenses?.data} 
                  summary={dashboardData.expenses?.summary} 
                  loading={loading} 
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      ) : null}
    </Layout>
  );
};

export default Dashboard;
