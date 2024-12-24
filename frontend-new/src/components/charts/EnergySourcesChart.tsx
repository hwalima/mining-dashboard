import React from 'react';
import { useTheme } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface EnergySourcesChartProps {
  startDate: Date;
  endDate: Date;
}

const EnergySourcesChart: React.FC<EnergySourcesChartProps> = ({ startDate, endDate }) => {
  const theme = useTheme();

  // Sample data - replace with actual data from your API
  const data = {
    labels: ['Grid Power', 'Solar', 'Diesel Generators', 'Wind', 'Other'],
    datasets: [
      {
        data: [45, 25, 20, 8, 2],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.grey[500],
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default EnergySourcesChart;
