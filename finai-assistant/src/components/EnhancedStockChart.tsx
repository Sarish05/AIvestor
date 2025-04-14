import React, { useState, useEffect, useRef, forwardRef } from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  ButtonGroup,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tooltip,
  Icon,
  useColorModeValue,
  Skeleton,
  Badge
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiInfo, FiRefreshCw, FiClock } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { StockHistoryData } from '../types/stock';
import { upstoxService } from '../services/upstoxService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale,
  Filler
);

// Animation variants for Framer Motion
const chartVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    } 
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  }
};

// Time interval options for the chart
const timeIntervalOptions = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '30D' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' }
];

interface EnhancedStockChartProps {
  symbol: string;
  name?: string;
  currentPrice?: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  timeInterval?: string;
}

const EnhancedStockChart = forwardRef<any, EnhancedStockChartProps>(({
  symbol,
  name,
  currentPrice = 0,
  previousClose = 0,
  change = 0,
  changePercent = 0,
  volume,
  marketCap,
  isLoading,
  onRefresh,
  timeInterval: propTimeInterval
}, ref) => {
  // State variables
  const [chartData, setChartData] = useState<StockHistoryData[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [timeInterval, setTimeInterval] = useState(propTimeInterval || '1M');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Get color mode values
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const chartColor = change >= 0 ? 'green.500' : 'red.500';
  const chartGradientTop = change >= 0 ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)';
  const chartGradientBottom = 'rgba(0, 0, 0, 0)';
  const additionalStatsBg = useColorModeValue('gray.50', 'gray.700');
  const positiveColor = '#48BB78';
  const negativeColor = '#F56565';
  const priceChangeColor = change >= 0 ? positiveColor : negativeColor;

  // Update timeInterval when prop changes
  useEffect(() => {
    if (propTimeInterval) {
      setTimeInterval(propTimeInterval);
    }
  }, [propTimeInterval]);

  // Fetch historical data
  useEffect(() => {
    const fetchData = async () => {
      setIsChartLoading(true);
      try {
        console.log(`Fetching chart data for ${symbol} with interval ${timeInterval}`);
        const data = await upstoxService.fetchHistoricalData(symbol, timeInterval);
        if (data && data.length > 0) {
          setChartData(data);
          setLastUpdated(new Date());
        } else {
          console.warn(`No data received for ${symbol}`);
        }
      } catch (error) {
        console.error(`Error fetching chart data for ${symbol}:`, error);
      } finally {
        setIsChartLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh for 1D interval
    let intervalId: NodeJS.Timeout | null = null;
    if (timeInterval === '1D') {
      intervalId = setInterval(() => {
        fetchData();
      }, 60000); // Refresh every minute
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [symbol, timeInterval]);

  // Format data for chart
  const data = {
    datasets: [
      {
        label: symbol,
        data: chartData.map(item => ({
          x: new Date(item.timestamp ? item.timestamp : item.date),
          y: item.close
        })),
        borderColor: change >= 0 ? positiveColor : negativeColor,
        backgroundColor: change >= 0 ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: change >= 0 ? positiveColor : negativeColor,
        pointHoverBorderColor: '#fff'
      }
    ]
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        displayColors: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return timeInterval === '1D' ? 
              date.toLocaleTimeString() : 
              date.toLocaleDateString();
          },
          label: (context) => {
            return `${context.dataset.label}: Rs${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeInterval === '1D' ? 'hour' : 
                timeInterval === '5D' ? 'day' : 
                timeInterval === '30D' ? 'day' : 
                timeInterval === '6M' ? 'month' : 'month',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM dd',
            month: 'MMM yyyy'
          },
          tooltipFormat: timeInterval === '1D' ? 'HH:mm' : 'MMM dd, yyyy'
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          color: textColor,
          autoSkip: true,
          maxTicksLimit: 6
        }
      },
      y: {
        position: 'right',
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          callback: (value) => `Rs${value}`,
          maxTicksLimit: 6
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  // Handle time interval change
  const handleIntervalChange = (interval: string) => {
    setTimeInterval(interval);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    
    // Refresh chart data
    const fetchData = async () => {
      setIsChartLoading(true);
      try {
        const data = await upstoxService.fetchHistoricalData(symbol, timeInterval);
        if (data && data.length > 0) {
          setChartData(data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error refreshing chart data:', error);
      } finally {
        setIsChartLoading(false);
      }
    };
    
    fetchData();
  };

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Not updated';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    return lastUpdated.toLocaleString();
  };

  const getOHLC = () => {
    if (!chartData || chartData.length === 0) return null;
    
    const open = chartData[0].open;
    const high = Math.max(...chartData.map(d => d.high));
    const low = Math.min(...chartData.map(d => d.low));
    const close = chartData[chartData.length - 1].close;
    const prev_close = previousClose;
    
    return { open, high, low, close, prev_close };
  };

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    getOHLC,
    getChartData: () => chartData,
    refreshChart: handleRefresh
  }));

  return (
    <Box 
      as={motion.div}
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      borderRadius="xl"
      boxShadow="xl"
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      width="100%"
      overflow="hidden"
      position="relative"
    >
      {isLoading ? (
        <>
          <Skeleton height="60px" width="200px" mb={4} />
          <Skeleton height="300px" />
        </>
      ) : (
        <>
          {/* Stock info header */}
          <Flex justifyContent="space-between" alignItems="flex-start" mb={6}>
            <Box>
              <Flex alignItems="center" mb={1}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  mr={2}
                  as={motion.p}
                  animate={{ opacity: [0.6, 1] }}
                  // @ts-ignore - Framer Motion types conflict with Chakra UI
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  {symbol}
                </Text>
                <Text fontSize="md" color="gray.500">{name}</Text>
              </Flex>

              <Stat mt={2}>
                <Flex alignItems="baseline">
                  <StatNumber fontSize="2xl" fontWeight="bold">
                    ${currentPrice.toFixed(2)}
                  </StatNumber>
                  <StatHelpText ml={2} color={priceChangeColor}>
                    <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
                    {change.toFixed(2)} ({changePercent.toFixed(2)}%)
                  </StatHelpText>
                </Flex>
              </Stat>
            </Box>

            <Box textAlign="right">
              <HStack spacing={2} mb={2} justifyContent="flex-end">
                <Badge colorScheme="blue" p={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={FiClock} mr={1} />
                    <Text fontSize="xs">{formatLastUpdated()}</Text>
                  </Flex>
                </Badge>
                
                <Tooltip label="Refresh data">
                  <Button
                    size="sm"
                    variant="ghost"
                    borderRadius="full"
                    onClick={handleRefresh}
                    as={motion.button}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon as={FiRefreshCw} />
                  </Button>
                </Tooltip>
              </HStack>
              
              <Flex justifyContent="flex-end" alignItems="center" gap={4}>
                <Tooltip label="Volume" placement="top">
                  <Text fontSize="sm" color="gray.500">
                    Vol: {volume ? volume.toLocaleString() : 'N/A'}
                  </Text>
                </Tooltip>
                {marketCap && (
                  <Tooltip label="Market Cap" placement="top">
                    <Text fontSize="sm" color="gray.500">
                      MCap: {marketCap}
                    </Text>
                  </Tooltip>
                )}
              </Flex>
            </Box>
          </Flex>

          {/* Chart content */}
          <Box mb={4}>
            <ButtonGroup size="sm" isAttached variant="outline" mb={4}>
              {timeIntervalOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleIntervalChange(option.value)}
                  colorScheme={timeInterval === option.value ? 'blue' : 'gray'}
                  variant={timeInterval === option.value ? 'solid' : 'outline'}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>

            <AnimatePresence mode="wait">
              <Box 
                height="300px" 
                width="100%"
                as={motion.div}
                key={timeInterval}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                // @ts-ignore - Framer Motion types conflict with Chakra UI
                transition={{ duration: 0.3 }}
              >
                {isChartLoading ? (
                  <Flex height="100%" alignItems="center" justifyContent="center">
                    <Box
                      as={motion.div}
                      animate={{
                        rotate: [0, 360],
                      }}
                      // @ts-ignore - Framer Motion types conflict with Chakra UI
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Icon as={FiRefreshCw} w={8} h={8} color="blue.400" />
                    </Box>
                  </Flex>
                ) : chartData.length > 0 ? (
                  <Line data={data} options={options} />
                ) : (
                  <Flex height="100%" alignItems="center" justifyContent="center">
                    <Text color="gray.500">No data available</Text>
                  </Flex>
                )}
              </Box>
            </AnimatePresence>
          </Box>

          {/* Additional stats */}
          <HStack 
            spacing={4} 
            mt={4} 
            p={3} 
            borderRadius="md" 
            bg={additionalStatsBg}
            as={motion.div}
            variants={pulseVariants}
            animate="pulse"
          >
            <Stat size="sm">
              <StatLabel fontSize="xs" color="blue.600">Open</StatLabel>
              <StatNumber fontSize="sm" color="blue.600">
                ${(chartData[0]?.open || 0).toFixed(2)}
              </StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs" color="green.600">High</StatLabel>
              <StatNumber fontSize="sm" color="green.600">
                ${Math.max(...chartData.map(d => d.high || 0)).toFixed(2)}
              </StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs" color="red.600">Low</StatLabel>
              <StatNumber fontSize="sm" color="red.600">
                ${Math.min(...chartData.map(d => d.low || 0)).toFixed(2)}
              </StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs" color="gray.600">Prev Close</StatLabel>
              <StatNumber fontSize="sm" color="gray.600">
                ${previousClose.toFixed(2)}
              </StatNumber>
            </Stat>
          </HStack>
        </>
      )}
    </Box>
  );
});

export default EnhancedStockChart;
