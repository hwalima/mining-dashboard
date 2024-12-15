import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Box,
} from '@mui/material';

interface Chemical {
  id: number;
  name: string;
  currentStock: number;
  minimumRequired: number;
  unit: string;
}

interface ChemicalsWidgetProps {
  chemicals: Chemical[];
}

const ChemicalsWidget: React.FC<ChemicalsWidgetProps> = ({ chemicals }) => {
  const getStockLevel = (current: number, minimum: number) => {
    const percentage = (current / minimum) * 100;
    if (percentage <= 50) return 'error';
    if (percentage <= 75) return 'warning';
    return 'success';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Chemical Inventory
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Chemical</TableCell>
                <TableCell align="right">Stock Level</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chemicals.map((chemical) => (
                <TableRow key={chemical.id}>
                  <TableCell component="th" scope="row">
                    {chemical.name}
                  </TableCell>
                  <TableCell align="right">
                    {chemical.currentStock} {chemical.unit}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(chemical.currentStock / chemical.minimumRequired) * 100}
                        color={getStockLevel(
                          chemical.currentStock,
                          chemical.minimumRequired
                        )}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ChemicalsWidget;
