import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import Layout from '../components/layout/Layout';
import { dashboardService } from '../services/api';
import { SafetyIncident } from '../services/api';

const Safety: React.FC = () => {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getSafetyIncidents();
        setIncidents(response.incidents);
      } catch (error) {
        console.error('Error fetching safety incidents:', error);
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
            Safety Incidents
          </Typography>
          <Grid container spacing={3}>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              incidents.map((incident) => (
                <Grid item xs={12} key={incident.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">{incident.title}</Typography>
                    <Typography>Date: {new Date(incident.date).toLocaleDateString()}</Typography>
                    <Typography>Severity: {incident.severity}</Typography>
                    <Typography>Description: {incident.description}</Typography>
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

export default Safety;
