import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Layout from '../components/layout/Layout';

const Equipment: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Equipment Management
          </Typography>
          {/* Add your equipment-specific content here */}
        </Box>
      </Container>
    </Layout>
  );
};

export default Equipment;
