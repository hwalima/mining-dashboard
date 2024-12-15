import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import Layout from '../components/layout/Layout';
import { dashboardService } from '../services/api';
import { ChemicalInventory } from '../services/api';

const Chemicals: React.FC = () => {
  const [chemicals, setChemicals] = useState<ChemicalInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getChemicals();
        setChemicals(response.chemicals);
      } catch (error) {
        console.error('Error fetching chemical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Chemical Inventory
          </Typography>
          <Grid container spacing={3}>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              chemicals.map((chemical) => (
                <Grid item xs={12} md={6} lg={4} key={chemical.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">{chemical.name}</Typography>
                    <Typography>Current Stock: {chemical.current_stock} {chemical.unit}</Typography>
                    <Typography>Minimum Required: {chemical.minimum_required} {chemical.unit}</Typography>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default Chemicals;
