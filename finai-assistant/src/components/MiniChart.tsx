import React, { useEffect, useState } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { StockHistoryData } from '../types/stock';
import { fetchStockHistory } from '../services/stockDataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MiniChartProps {
  symbol: string;
  price: number;
  change: number;
  changePercentage: number;
}

const MiniChart: React.FC<MiniChartProps> = ({ symbol, price, change, changePercentage }) => {
  const [chartData, setChartData] = useState<StockHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchStockHistory(symbol);
        setChartData(data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100%">
        <Spinner size="sm" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100%">
        <Text fontSize="xs" color="red.500">
          Error
        </Text>
      </Box>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  const data = {
    labels: chartData.map(d => d.date.toLocaleTimeString()),
    datasets: [
      {
        data: chartData.map(d => d.close),
        borderColor: change >= 0 ? '#48BB78' : '#F56565',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  return (
    <Box h="100%" w="100%">
      <Line options={options} data={data} />
    </Box>
  );
};

export default MiniChart; 