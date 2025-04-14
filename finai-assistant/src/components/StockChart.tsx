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

interface StockChartProps {
  symbol: string;
  companyName: string;
  period: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
}

const StockChart: React.FC<StockChartProps> = ({ symbol, companyName, period }) => {
  const [chartData, setChartData] = useState<StockHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchStockHistory(symbol);
        setChartData(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, period]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="400px">
        <Text color="red.500">{error}</Text>
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
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const data = context.raw as number;
            return `₹${data.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price (₹)',
        },
      },
    },
  };

  const data = {
    labels: chartData.map(d => d.date.toLocaleString()),
    datasets: [
      {
        label: companyName,
        data: chartData.map(d => d.close),
        borderColor: '#3182CE',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Box>
      <Box h="400px" w="100%">
        <Line options={options} data={data} />
      </Box>
      {lastUpdated && (
        <Text fontSize="sm" color="gray.500" mt={2}>
          Last updated: {lastUpdated.toLocaleString()}
        </Text>
      )}
    </Box>
  );
};

export default StockChart; 