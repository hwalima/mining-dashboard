import React from 'react';
import { useTheme } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EnergyEfficiencyChartProps {
  startDate: Date;
  endDate: Date;
}

const EnergyEfficiencyChart: React.FC<EnergyEfficiencyChartProps> = ({ startDate, endDate }) => {
  const theme = useTheme();

  // Sample data - replace with actual data from your API
  const data = {
    labels: ['Drilling', 'Crushing', 'Processing', 'Ventilation', 'Transport', 'Other'],
    datasets: [
      {
        label: 'Energy Efficiency Rating',
        data: [85, 78, 92, 88, 82, 75],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.error.main,
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Efficiency: ${context.raw}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      x: {
        grid: {
          color: theme.palette.divider,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default EnergyEfficiencyChart;
