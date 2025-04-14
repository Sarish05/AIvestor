import React, { useState, useEffect } from 'react';
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
  IconButton
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiClock } from 'react-icons/fi';
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
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Transaction, Portfolio } from '../types/stock';

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

// Animation variants
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

// Time interval options
const timeIntervalOptions = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: 'All', value: 'ALL' }
];

// Define interface for portfolio data point
interface PortfolioDataPoint {
  date: Date;
  value: number;
}

interface PortfolioChartProps {
  portfolio: Portfolio;
  timeInterval?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({
  portfolio,
  timeInterval: propTimeInterval,
  onRefresh,
  isLoading = false
}) => {
  const [chartData, setChartData] = useState<PortfolioDataPoint[]>([]);
  const [timeInterval, setTimeInterval] = useState<string>(propTimeInterval || '1M');
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Colors based on theme
  const lineColor = useColorModeValue('#3182CE', '#63B3ED');
  const gradientTopColor = useColorModeValue('rgba(49, 130, 206, 0.4)', 'rgba(99, 179, 237, 0.4)');
  const gradientBottomColor = useColorModeValue('rgba(49, 130, 206, 0)', 'rgba(99, 179, 237, 0)');
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('#2D3748', '#E2E8F0');

  // Calculate changes
  const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : portfolio.initialInvestment;
  const startValue = chartData.length > 0 ? chartData[0].value : portfolio.initialInvestment;
  const change = currentValue - startValue;
  const changePercent = startValue > 0 ? (change / startValue) * 100 : 0;

  // Price change colors
  const positiveColor = '#48BB78';
  const negativeColor = '#F56565';
  const priceChangeColor = change >= 0 ? positiveColor : negativeColor;

  // Update timeInterval when prop changes
  useEffect(() => {
    if (propTimeInterval) {
      setTimeInterval(propTimeInterval);
    }
  }, [propTimeInterval]);

  // Generate portfolio history based on transactions
  useEffect(() => {
    const generatePortfolioHistory = () => {
      setIsChartLoading(true);
      try {
        // Sort transactions by date
        const sortedTransactions = [...portfolio.transactions].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (sortedTransactions.length === 0) {
          // No transactions, create a minimal chart with initial investment
          const today = new Date();
          const startDate = new Date();
          startDate.setMonth(today.getMonth() - 1); // Default to 1 month ago
          
          const dataPoints: PortfolioDataPoint[] = [
            { date: startDate, value: portfolio.initialInvestment },
            { date: today, value: portfolio.initialInvestment }
          ];
          
          setChartData(dataPoints);
          setIsChartLoading(false);
          return;
        }

        // Determine the start date based on the selected time interval
        const now = new Date();
        let startDate = new Date(sortedTransactions[0].date);
        
        if (timeInterval !== 'ALL') {
          startDate = new Date();
          switch (timeInterval) {
            case '1W':
              startDate.setDate(now.getDate() - 7);
              break;
            case '1M':
              startDate.setMonth(now.getMonth() - 1);
              break;
            case '3M':
              startDate.setMonth(now.getMonth() - 3);
              break;
            case '6M':
              startDate.setMonth(now.getMonth() - 6);
              break;
            case '1Y':
              startDate.setFullYear(now.getFullYear() - 1);
              break;
            default:
              // Default to all-time if not recognized
              startDate = new Date(sortedTransactions[0].date);
          }
        }

        // Filter transactions within the time range
        const relevantTransactions = sortedTransactions.filter(
          transaction => new Date(transaction.date) >= startDate
        );

        // Generate data points
        const dataPoints: PortfolioDataPoint[] = [];
        
        // Start with initial investment if no transactions or start date is before first transaction
        const firstTransactionDate = new Date(sortedTransactions[0].date);
        if (relevantTransactions.length === 0 || startDate < firstTransactionDate) {
          dataPoints.push({ date: startDate, value: portfolio.initialInvestment });
        }

        // Calculate portfolio value at each transaction
        let runningCash = portfolio.initialInvestment;
        let holdings: Record<string, { shares: number, avgPrice: number }> = {};

        // Process all transactions to build history
        for (const transaction of sortedTransactions) {
          const transactionDate = new Date(transaction.date);
          
          // Skip if before our start date
          if (transactionDate < startDate) {
            // Still update our running state
            if (transaction.type === 'buy') {
              runningCash -= transaction.total;
              
              // Update holdings
              if (!holdings[transaction.ticker]) {
                holdings[transaction.ticker] = { shares: 0, avgPrice: 0 };
              }
              
              const currentHolding = holdings[transaction.ticker];
              const newTotalShares = currentHolding.shares + transaction.shares;
              
              // Update average price
              holdings[transaction.ticker] = {
                shares: newTotalShares,
                avgPrice: (currentHolding.shares * currentHolding.avgPrice + transaction.shares * transaction.price) / newTotalShares
              };
            } else if (transaction.type === 'sell') {
              runningCash += transaction.total;
              
              // Update holdings
              if (holdings[transaction.ticker]) {
                holdings[transaction.ticker].shares -= transaction.shares;
                
                // Remove if no shares left
                if (holdings[transaction.ticker].shares <= 0) {
                  delete holdings[transaction.ticker];
                }
              }
            }
            continue;
          }

          // For transactions within our time range
          if (transaction.type === 'buy') {
            runningCash -= transaction.total;
            
            // Update holdings
            if (!holdings[transaction.ticker]) {
              holdings[transaction.ticker] = { shares: 0, avgPrice: 0 };
            }
            
            const currentHolding = holdings[transaction.ticker];
            const newTotalShares = currentHolding.shares + transaction.shares;
            
            // Update average price
            holdings[transaction.ticker] = {
              shares: newTotalShares,
              avgPrice: (currentHolding.shares * currentHolding.avgPrice + transaction.shares * transaction.price) / newTotalShares
            };
          } else if (transaction.type === 'sell') {
            runningCash += transaction.total;
            
            // Update holdings
            if (holdings[transaction.ticker]) {
              holdings[transaction.ticker].shares -= transaction.shares;
              
              // Remove if no shares left
              if (holdings[transaction.ticker].shares <= 0) {
                delete holdings[transaction.ticker];
              }
            }
          }

          // Calculate total value of holdings at this point
          const holdingsValue = Object.entries(holdings).reduce((total, [ticker, holding]) => {
            // Find the latest price for this asset from portfolio.assets
            const asset = portfolio.assets.find(a => a.symbol === ticker);
            const currentPrice = asset ? asset.currentPrice : holding.avgPrice;
            return total + (holding.shares * currentPrice);
          }, 0);

          // Add data point for this transaction
          dataPoints.push({ 
            date: transactionDate, 
            value: runningCash + holdingsValue 
          });
        }

        // Add current date point if we have transactions and last one isn't today
        const lastPoint = dataPoints[dataPoints.length - 1];
        if (dataPoints.length > 0 && 
            now.getDate() !== lastPoint.date.getDate() || 
            now.getMonth() !== lastPoint.date.getMonth() ||
            now.getFullYear() !== lastPoint.date.getFullYear()) {
          
          // Calculate current portfolio value
          const currentHoldingsValue = portfolio.assets.reduce(
            (total, asset) => total + asset.totalValue, 
            0
          );
          
          dataPoints.push({ 
            date: now, 
            value: portfolio.cash + currentHoldingsValue 
          });
        }

        // If we have no data points after all this, create a default
        if (dataPoints.length === 0) {
          dataPoints.push({ date: startDate, value: portfolio.initialInvestment });
          dataPoints.push({ date: now, value: portfolio.cash + portfolio.assets.reduce((sum, a) => sum + a.totalValue, 0) });
        }

        // Ensure at least two points for a proper line
        if (dataPoints.length === 1) {
          const value = dataPoints[0].value;
          dataPoints.push({ date: now, value });
        }

        setChartData(dataPoints);
      } catch (error) {
        console.error('Error generating portfolio history:', error);
      } finally {
        setIsChartLoading(false);
        setLastUpdated(new Date());
      }
    };

    generatePortfolioHistory();
  }, [portfolio, timeInterval]);

  // Format the last updated time
  const formatLastUpdated = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
  };

  // Handle changing the time interval
  const handleIntervalChange = (interval: string) => {
    setTimeInterval(interval);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Re-generate chart data if no refresh handler
      setIsChartLoading(true);
      setTimeout(() => {
        const currentHoldingsValue = portfolio.assets.reduce(
          (total, asset) => total + asset.totalValue, 
          0
        );
        
        // Add current data point
        const now = new Date();
        const newData = [...chartData];
        newData.push({ date: now, value: portfolio.cash + currentHoldingsValue });
        setChartData(newData);
        setIsChartLoading(false);
        setLastUpdated(now);
      }, 500);
    }
  };

  // Prepare chart data
  const data = {
    labels: chartData.map(d => d.date),
    datasets: [
      {
        label: 'Portfolio Value',
        data: chartData.map(d => d.value),
        borderColor: lineColor,
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          
          const gradient = ctx.createLinearGradient(
            0, chartArea.top, 0, chartArea.bottom
          );
          gradient.addColorStop(0, gradientTopColor);
          gradient.addColorStop(1, gradientBottomColor);
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: lineColor,
        pointHoverRadius: 5,
        tension: 0.2,
        fill: true
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Portfolio Value: ₹${context.parsed.y.toFixed(2)}`;
          },
          title: function(context: any) {
            const date = new Date(context[0].label);
            return date.toLocaleDateString();
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: (timeInterval === '1W' ? 'day' : 
                timeInterval === '1M' ? 'week' : 
                timeInterval === '3M' ? 'week' : 
                timeInterval === '6M' ? 'month' : 'month') as 'day' | 'week' | 'month',
          displayFormats: {
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy',
          },
        },
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
          callback: function(value: any) {
            return `₹${value.toLocaleString()}`;
          }
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  return (
    <Box 
      borderRadius="lg" 
      borderWidth="1px" 
      p={4} 
      bg={useColorModeValue('white', 'gray.800')}
      as={motion.div}
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6, ease: "easeOut" } as any}
    >
      {isLoading ? (
        <Skeleton height="330px" width="100%" />
      ) : (
        <>
          {/* Header */}
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="lg" fontWeight="bold">Portfolio Performance</Text>
              <HStack>
                <Text fontSize="sm" color="gray.500">
                  <Icon as={FiClock} mr={1} />
                  Updated {formatLastUpdated()}
                </Text>
                <IconButton
                  aria-label="Refresh data"
                  icon={<FiRefreshCw />}
                  size="xs"
                  variant="ghost"
                  onClick={handleRefresh}
                />
              </HStack>
            </Box>
            
            <Stat textAlign="right">
              <StatNumber fontSize="xl">₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatNumber>
              <StatHelpText mb={0}>
                <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({Math.abs(changePercent).toFixed(2)}%)
              </StatHelpText>
            </Stat>
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
                transition={{ duration: 0.3 } as any}
              >
                {isChartLoading ? (
                  <Flex height="100%" alignItems="center" justifyContent="center">
                    <Box
                      as={motion.div}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      } as any}
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

          {/* Summary stats */}
          <HStack spacing={4} mb={2} mt={3}>
            <Stat size="sm">
              <StatLabel fontSize="xs">Initial Investment</StatLabel>
              <StatNumber fontSize="sm">₹{portfolio.initialInvestment.toLocaleString()}</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs">Cash Balance</StatLabel>
              <StatNumber fontSize="sm">₹{portfolio.cash.toLocaleString()}</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs">Holding Value</StatLabel>
              <StatNumber fontSize="sm">
                ₹{portfolio.assets.reduce((sum, asset) => sum + asset.totalValue, 0).toLocaleString()}
              </StatNumber>
            </Stat>
          </HStack>
        </>
      )}
    </Box>
  );
};

export default PortfolioChart;
