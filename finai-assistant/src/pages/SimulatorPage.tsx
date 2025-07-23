import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  NumberInput,
  NumberInputField,
  useDisclosure,
  Text,
  Switch,
  Spinner,
  VStack,
  HStack,
  Grid,
  GridItem,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Icon,
  Progress,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiArrowUp, FiArrowDown, FiChevronDown, FiPlus, FiSearch, FiRefreshCw, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import StockChart from '../components/StockChart';
import EnhancedStockChart from '../components/EnhancedStockChart';
import PortfolioChart from '../components/PortfolioChart'; 
import ProtectedFeature from '../components/ProtectedFeature';
import {
  MarketStock,
  PortfolioStock,
  Portfolio
} from '../types/stock';

const MotionBox = motion(Box);

const SimulatorPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [buyAmount, setBuyAmount] = useState(1000);
  const [selectedStock, setSelectedStock] = useState<MarketStock | PortfolioStock | null>(null);
  const [selectedChartInterval, setSelectedChartInterval] = useState<string>('1M');
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [marketStocks] = useState<MarketStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSector] = useState<string | null>(null);
  const [showStockDetail, setShowStockDetail] = useState(false);
  const [isLoadingCSV, setIsLoadingCSV] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash: 100000,
    assets: [],
    transactions: [],
    initialInvestment: 100000
  });

  // Load real market data - removed for yfinance implementation
  useEffect(() => {
    // Market data will be fetched using yfinance
    setLoading(false);
  }, []);

  // Load CSV stocks data - removed for yfinance implementation
  useEffect(() => {
    // CSV data loading removed - will use yfinance instead
    setIsLoadingCSV(false);
  }, []);
  
  // Convert CSV stock to StockData format
  // Filter stocks based on search and sector
  const filteredStocks = Array.isArray(marketStocks) ? marketStocks.filter(stock => {
    const matchesSearch = searchTerm === '' || 
      stock.SYMBOL.toLowerCase().includes(searchTerm.toLowerCase()) || 
      stock.NAME.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSector = selectedSector === null || stock.SECTOR === selectedSector;
    
    return matchesSearch && matchesSector;
  }) : [];

  // Updated handler that sets showStockDetail flag
  const handleStockSelection = async (stock: MarketStock) => {
    try {
      // Stock selection logic - will be updated for yfinance
      setSelectedStock(stock);
      setShowStockDetail(true); // Show detail view
    } catch (error) {
      console.error('Error selecting stock:', error);
      setSelectedStock(stock);
      setShowStockDetail(true); // Show detail view even if fetch fails
    }
  };

  // New handler for portfolio assets
  const handlePortfolioAssetSelection = (asset: PortfolioStock) => {
    setSelectedStock({
      SYMBOL: asset.symbol,
      NAME: asset.name,
      PRICE: asset.currentPrice,
      CHANGE: asset.profitLoss,
      CHANGE_PERCENT: (asset.profitLoss / asset.purchasePrice) * 100,
      VOLUME: '0',
      MARKET_CAP: '0',
      PREV_CLOSE: asset.purchasePrice,
      OPEN: asset.purchasePrice,
      HIGH: asset.currentPrice,
      LOW: asset.purchasePrice,
      CLOSE: asset.currentPrice,
      SECTOR: asset.sector || '',
      timestamp: new Date(),
      lastUpdated: new Date().toISOString(),
    });
    setTransactionType('sell');
    onOpen();
  };

  // Handle back button to return to table view
  const handleBackToMarket = () => {
    setShowStockDetail(false); // Hide detail view but keep selectedStock
  };

  // Function to reload data - updated for yfinance
  const refreshData = async () => {
    try {
      setIsLoadingCSV(true);
      // Data refresh logic will be implemented with yfinance
      setIsLoadingCSV(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsLoadingCSV(false);
    }
  };

  // Updated handleTransaction function
  const handleTransaction = () => {
    if (transactionType === 'buy') {
      if (!selectedStock || !buyAmount) return;

      const stockPrice = (selectedStock as MarketStock).PRICE || (selectedStock as PortfolioStock).currentPrice;
      const shares = Math.floor(buyAmount / stockPrice);
      const transactionAmount = shares * stockPrice;
      
      if (transactionAmount > portfolio.cash) {
        alert('Insufficient funds');
        return;
      }
      
      setPortfolio(prev => {
        const newCash = prev.cash - transactionAmount;
        
        // Check if we already have this stock
        const existingAssetIndex = prev.assets.findIndex(
          asset => asset.symbol === ((selectedStock as MarketStock).SYMBOL || (selectedStock as PortfolioStock).symbol)
        );
        
        if (existingAssetIndex === -1) {
          // Add as a new asset
          const newAsset: PortfolioStock = {
            symbol: (selectedStock as MarketStock).SYMBOL || (selectedStock as PortfolioStock).symbol,
            name: (selectedStock as MarketStock).NAME || (selectedStock as PortfolioStock).name,
            shares: shares,
            purchasePrice: stockPrice,
            currentPrice: stockPrice,
            totalValue: shares * stockPrice,
            profitLoss: 0,
            profitLossPercentage: 0,
            purchaseDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            sector: (selectedStock as MarketStock).SECTOR || (selectedStock as PortfolioStock).sector || 'Unknown',
            transactions: [],
            weight: (shares * stockPrice) / (prev.cash + prev.assets.reduce((acc, curr) => acc + curr.totalValue, 0)) * 100
          };
          
          return {
            ...prev,
            cash: newCash,
            assets: [...prev.assets, newAsset],
            transactions: [
              ...prev.transactions,
              {
                date: new Date(),
                ticker: newAsset.symbol,
                type: 'buy',
                shares: shares,
                price: stockPrice,
                total: transactionAmount
              }
            ]
          };
        } else {
          // Update existing asset
          const existingAsset = prev.assets[existingAssetIndex];
          const newShares = existingAsset.shares + shares;
          // Calculate new average purchase price
          const newPurchasePrice = 
            ((existingAsset.purchasePrice * existingAsset.shares) + (stockPrice * shares)) / newShares;
          
          const updatedAssets = [...prev.assets];
          updatedAssets[existingAssetIndex] = {
            ...existingAsset,
            shares: newShares,
            purchasePrice: newPurchasePrice,
            currentPrice: stockPrice,
            totalValue: newShares * stockPrice,
            profitLoss: stockPrice - newPurchasePrice,
            profitLossPercentage: ((stockPrice - newPurchasePrice) / newPurchasePrice) * 100,
            lastUpdated: new Date().toISOString()
          };
          
          return {
            ...prev,
            cash: newCash,
            assets: updatedAssets,
            transactions: [
              ...prev.transactions,
              {
                date: new Date(),
                ticker: existingAsset.symbol,
                type: 'buy',
                shares: shares,
                price: stockPrice,
                total: transactionAmount
              }
            ]
          };
        }
      });
      
      onClose();
    } else if (transactionType === 'sell') {
      if (!selectedStock) return;
      
      const stockSymbol = (selectedStock as MarketStock).SYMBOL || (selectedStock as PortfolioStock).symbol;
      const stockPrice = (selectedStock as MarketStock).PRICE || (selectedStock as PortfolioStock).currentPrice;
      
      // Find the asset in the portfolio
      const assetIndex = portfolio.assets.findIndex(a => a.symbol === stockSymbol);
      
      if (assetIndex === -1) {
        alert(`You don't own any shares of ${stockSymbol}`);
        return;
      }
      
      const asset = portfolio.assets[assetIndex];
      
      // For sell transactions, we'll use the buyAmount as the number of shares to sell directly
      // instead of calculating it from the total amount
      let sharesToSell = Math.floor(buyAmount);
      
      // Make sure they're not trying to sell more than they own
      if (sharesToSell > asset.shares) {
        sharesToSell = asset.shares; // Automatically adjust to sell all available shares
      }
      
      if (sharesToSell <= 0) {
        alert('Please enter a valid number of shares to sell');
        return;
      }
      
      const transactionAmount = sharesToSell * stockPrice;
      
      setPortfolio(prev => {
        const newCash = prev.cash + transactionAmount;
        const newShares = asset.shares - sharesToSell;
        
        // Only remove the asset from the portfolio if all shares are sold (zero shares left)
        if (newShares === 0) {
          return {
            ...prev,
            cash: newCash,
            assets: prev.assets.filter(a => a.symbol !== stockSymbol),
            transactions: [
              ...prev.transactions,
              {
                date: new Date(),
                ticker: stockSymbol,
                type: 'sell',
                shares: sharesToSell,
                price: stockPrice,
                total: transactionAmount
              }
            ]
          };
        } else {
          // Otherwise, update the asset with the new share count
          return {
            ...prev,
            cash: newCash,
            assets: prev.assets.map(a => 
              a.symbol === stockSymbol
                ? {
                    ...a,
                    shares: newShares,
                    totalValue: newShares * stockPrice,
                    lastUpdated: new Date().toISOString()
                  }
                : a
            ),
            transactions: [
              ...prev.transactions,
              {
                date: new Date(),
                ticker: stockSymbol,
                type: 'sell',
                shares: sharesToSell,
                price: stockPrice,
                total: transactionAmount
              }
            ]
          };
        }
      });
      
      onClose();
    }
  };

  const allocations = [
    { name: 'Technology', value: 53.54, color: '#0EA5E9' },
    { name: 'Automotive', value: 15.98, color: '#F59E0B' },
    { name: 'Consumer Cyclical', value: 18.88, color: '#10B981' },
    { name: 'Communication Services', value: 12.52, color: '#8B5CF6' }
  ];

  // Header gradient for simulator page
  const simulatorGradient = "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)";

  // Add real-time data refresh effect - updated for yfinance
  useEffect(() => {
    // Auto-refresh functionality will be implemented with yfinance
    if (autoRefresh) {
      const refreshInterval = setInterval(() => {
        // Refresh market data with yfinance
        setLastUpdated(new Date());
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [autoRefresh]);

  // Initialize component

  // Add toggle for auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const calculatePortfolioValue = () => {
    return portfolio.assets.reduce((total, asset) => total + asset.totalValue, portfolio.cash);
  };

  const calculatePortfolioReturn = () => {
    const totalValue = calculatePortfolioValue();
    return ((totalValue - portfolio.initialInvestment) / portfolio.initialInvestment) * 100;
  };

  // Handle market search input - simplified without API search
  const handleMarketSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const chartRef = useRef<any>(null);

  return (
    <Box minH="100vh" bg="darkBlue.900">
      {/* Custom Page Header */}
      <Box 
        position="fixed" 
        top="0" 
        left="0" 
        right="0" 
        zIndex="999"
        overflow="hidden"
      >
        {/* Background decorative elements */}
        <Box
          position="absolute"
          top="-10px"
          left="-10px"
          right="-10px"
          bottom="-10px"
          bgGradient={simulatorGradient}
          opacity="0.95"
          filter="blur(0px)"
          transform="skewY(-1deg)"
          boxShadow="lg"
        />
        
        {/* Light pattern overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          backgroundImage="url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        />
        
        {/* Navigation Component */}
        <Navigation />
        
        {/* Decorative investment icon */}
        <MotionBox
          position="absolute"
          top="0"
          right="20px"
          opacity="0.2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Icon as={FiTrendingUp} color="white" boxSize="80px" />
        </MotionBox>
      </Box>
      
      <Box as="main" pt="120px">
        <Container maxW="container.xl" px={4}>
          {/* Dashboard Heading */}
          <Flex justify="space-between" align="flex-start" mb={8}>
            <Box>
              <Heading size="xl">Trading Simulator</Heading>
              <Text color="gray.400">Practice trading with virtual money and real-time stock data</Text>
          </Box>
            <Flex align="center">
              <Button
                variant="outline"
                size="sm"
                bg="white"
                leftIcon={<Icon as={FiRefreshCw} />}
                onClick={refreshData}
                mr={4}
                isLoading={isLoadingCSV}
              >
                Refresh Data
              </Button>
              <HStack>
                <Switch
                  isChecked={autoRefresh}
                  onChange={toggleAutoRefresh}
                  colorScheme="blue"
                />
                <Text fontSize="sm" color="gray.400">
                  Auto-refresh {autoRefresh ? 'On' : 'Off'}
                </Text>
              </HStack>
              {lastUpdated && (
                <Text fontSize="sm" color="gray.400" ml={4}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </Flex>
          </Flex>

          {/* Portfolio Summary */}
          <ProtectedFeature
            featureName="Investment Simulator"
            fallback={
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card"
                p={6}
                borderRadius="xl"
                textAlign="center"
                mb={8}
              >
                <Icon as={FiTrendingUp} boxSize={12} color="green.400" mb={4} />
                <Heading size="md" mb={2}>Investment Simulator</Heading>
                <Text mb={4}>Sign in to access our virtual investment simulator and practice trading without risking real money.</Text>
                <Button colorScheme="green">Sign In to Start Investing</Button>
              </MotionBox>
            }
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card"
              p={6}
              mb={8}
            >
              <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={6}>
                <GridItem>
                  <VStack align="stretch" spacing={6}>
                    <Heading size="md">Your Virtual Portfolio</Heading>
                    
                    <Box>
                      <Text color="gray.400">Total Value</Text>
                      <Flex align="baseline">
                        <Heading size="xl">₹{calculatePortfolioValue().toLocaleString()}</Heading>
                        <Stat ml={4}>
                          <StatHelpText>
                            <StatArrow type={calculatePortfolioReturn() >= 0 ? 'increase' : 'decrease'} />
                            {calculatePortfolioReturn().toFixed(2)}% overall
                          </StatHelpText>
                        </Stat>
                      </Flex>
                    </Box>
                    
                    <SimpleGrid columns={2} spacing={4}>
                      <Stat>
                        <StatLabel>Cash Available</StatLabel>
                        <StatNumber>₹{portfolio.cash.toLocaleString()}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Daily Change</StatLabel>
                        <StatNumber color={calculatePortfolioReturn() >= 0 ? 'green.400' : 'red.400'}>
                          ₹{Math.abs(calculatePortfolioReturn()).toFixed(2)}
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type={calculatePortfolioReturn() >= 0 ? 'increase' : 'decrease'} />
                          {Math.abs(calculatePortfolioReturn())}%
                        </StatHelpText>
                      </Stat>
                    </SimpleGrid>
                    
                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm">Initial Investment</Text>
                        <Text fontSize="sm">₹{portfolio.initialInvestment.toLocaleString()}</Text>
                      </Flex>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm">Current Value</Text>
                        <Text fontSize="sm">₹{calculatePortfolioValue().toLocaleString()}</Text>
                      </Flex>
                      <Flex justify="space-between" mb={4}>
                        <Text fontSize="sm">Total Return</Text>
                        <Text 
                          fontSize="sm" 
                          fontWeight="bold"
                          color={calculatePortfolioReturn() >= 0 ? 'green.400' : 'red.400'}
                        >
                          ₹{(calculatePortfolioValue() - portfolio.initialInvestment).toLocaleString()} ({calculatePortfolioReturn().toFixed(2)}%)
                        </Text>
                      </Flex>
                      
                      <Button size="sm" bg="white" leftIcon={<FiRefreshCw />} variant="outline" width="full">
                        Reset Portfolio
                      </Button>
                    </Box>
                  </VStack>
                </GridItem>
                
                <GridItem>
                  <Flex direction="column" h="100%">
                    <Heading size="md" mb={4}>Portfolio Performance</Heading>
                    <Box flex="1" minH="200px">
                      <PortfolioChart 
                        portfolio={portfolio}
                        timeInterval={selectedChartInterval}
                        isLoading={loading}
                        onRefresh={() => {
                          // Refresh the portfolio chart data
                          const newDate = new Date();
                          setLastUpdated(newDate);
                        }}
                      />
                    </Box>
                    <HStack spacing={6} mt={6} justify="center">
                      <Button size="sm" variant="ghost">1D</Button>
                      <Button size="sm" variant="ghost">1W</Button>
                      <Button size="sm" variant="ghost">1M</Button>
                      <Button size="sm" variant="ghost" colorScheme="blue">3M</Button>
                      <Button size="sm" variant="ghost">YTD</Button>
                      <Button size="sm" variant="ghost">1Y</Button>
                      <Button size="sm" variant="ghost">ALL</Button>
                    </HStack>
                  </Flex>
                </GridItem>
              </Grid>
            </MotionBox>
          </ProtectedFeature>

          {/* Portfolio Details Tabs */}
          <Box mb={10}>
            <Tabs variant="soft-rounded" colorScheme="blue">
              <TabList mb={6}>
                <Tab>Holdings</Tab>
                <Tab>Transactions</Tab>
                <Tab>Market</Tab>
                <Tab>Allocation</Tab>
              </TabList>

              <TabPanels>
                {/* Holdings Tab */}
                <TabPanel p={0}>
                  <Box className="glass-card" p={0} overflow="hidden">
                    <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                      <Flex justify="space-between" align="center">
                        <Heading size="sm">Your Holdings</Heading>
                        <HStack>
                          <Menu>
                            <MenuButton bg="white" as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline">
                              Sort By
                            </MenuButton>
                            <MenuList bg="darkBlue.800" borderColor="whiteAlpha.300">
                              <MenuItem>Value (High to Low)</MenuItem>
                              <MenuItem>Value (Low to High)</MenuItem>
                              <MenuItem>Performance (Best First)</MenuItem>
                              <MenuItem>Performance (Worst First)</MenuItem>
                              <MenuItem>Alphabetical</MenuItem>
                            </MenuList>
                          </Menu>
                          <Button size="sm" leftIcon={<FiPlus />} colorScheme="blue">
                            Add Stock
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>
                    
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Ticker</Th>
                          <Th>Name</Th>
                          <Th isNumeric>Shares</Th>
                          <Th isNumeric>Avg. Price</Th>
                          <Th isNumeric>Current Price</Th>
                          <Th isNumeric>Value</Th>
                          <Th isNumeric>Return</Th>
                          <Th isNumeric>Weight</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {portfolio.assets.map((asset) => (
                          <Tr key={asset.symbol} _hover={{ bg: "whiteAlpha.100" }}>
                            <Td fontWeight="bold">{asset.symbol}</Td>
                            <Td>
                              <Text 
                                cursor="pointer" 
                                _hover={{ textDecoration: "underline", color: "blue.300" }}
                                onClick={() => handlePortfolioAssetSelection(asset)}
                              >
                                {asset.name}
                              </Text>
                            </Td>
                            <Td isNumeric>{asset.shares}</Td>
                            <Td isNumeric>₹{asset.purchasePrice?.toFixed(2) || 'N/A'}</Td>
                            <Td isNumeric>
                              <HStack justify="flex-end" spacing={1}>
                                <Text>₹{asset.currentPrice?.toFixed(2) || 'N/A'}</Text>
                                <Icon 
                                  as={asset.profitLoss >= 0 ? FiArrowUp : FiArrowDown} 
                                  color={asset.profitLoss >= 0 ? 'green.400' : 'red.400'}
                                  boxSize={3}
                                />
                              </HStack>
                            </Td>
                            <Td isNumeric>₹{asset.totalValue.toFixed(2)}</Td>
                            <Td isNumeric>
                              <Text 
                                color={
                                  asset.currentPrice && asset.currentPrice > asset.purchasePrice ? 'green.400' : 
                                  asset.currentPrice && asset.currentPrice < asset.purchasePrice ? 'red.400' : 
                                  'gray.400'
                                }
                              >
                                {asset.profitLossPercentage.toFixed(2)}%
                              </Text>
                            </Td>
                            <Td isNumeric>{asset.weight?.toFixed(2)}%</Td>
                            <Td>
                              <Button 
                                size="xs" 
                                colorScheme="blue" 
                                variant="solid" 
                                onClick={() => handlePortfolioAssetSelection(asset)}
                              >
                                Trade
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>

                {/* Transactions Tab */}
                <TabPanel p={0}>
                  <Box className="glass-card" p={0} overflow="hidden">
                    <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                      <Flex justify="space-between" align="center">
                        <Heading size="sm">Transaction History</Heading>
                        <HStack>
                          <Menu>
                            <MenuButton bg="white" as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline">
                              Filter
                            </MenuButton>
                            <MenuList bg="darkBlue.800" borderColor="whiteAlpha.300">
                              <MenuItem>All Transactions</MenuItem>
                              <MenuItem>Buy Orders</MenuItem>
                              <MenuItem>Sell Orders</MenuItem>
                              <MenuItem>Deposits</MenuItem>
                              <MenuItem>Withdrawals</MenuItem>
                            </MenuList>
                          </Menu>
                          <Button bg="white" size="sm" leftIcon={<FiCalendar />} variant="outline">
                            Date Range
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>
                    
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Type</Th>
                          <Th>Ticker</Th>
                          <Th isNumeric>Shares</Th>
                          <Th isNumeric>Price</Th>
                          <Th isNumeric>Total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {portfolio.transactions.map((transaction, index) => (
                          <Tr key={index} _hover={{ bg: "whiteAlpha.100" }}>
                            <Td>{transaction.date instanceof Date ? transaction.date.toLocaleDateString() : new Date(transaction.date).toLocaleDateString()}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  transaction.type === 'buy' ? 'green' :
                                  transaction.type === 'sell' ? 'red' :
                                  transaction.type === 'deposit' ? 'blue' : 'orange'
                                }
                                borderRadius="full"
                                px={2}
                                py={0.5}
                              >
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </Badge>
                            </Td>
                            <Td>{transaction.ticker || '-'}</Td>
                            <Td isNumeric>{transaction.shares || '-'}</Td>
                            <Td isNumeric>{transaction.price ? `₹${transaction.price.toFixed(2)}` : '-'}</Td>
                            <Td isNumeric>₹{transaction.total.toFixed(2)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>

                {/* Market Tab */}
                <TabPanel>
                  <Box>
                    <Flex justify="space-between" align="center" mb={6}>
                      <Heading size="md">Market Stocks</Heading>
                      <Flex align="center">
                        <InputGroup size="sm" maxW="300px">
                          <InputLeftElement pointerEvents="none">
                              <Icon as={FiSearch} color="gray.400" />
                            </InputLeftElement>
                            <Input 
                            placeholder="Search stocks..." 
                            value={searchTerm}
                            onChange={handleMarketSearchChange}
                            />
                          </InputGroup>
                      </Flex>
                    </Flex>
                    
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontSize="sm" color="gray.400">
                        Real-time market data will be provided by yfinance
                      </Text>
                      <Flex align="center">
                        <Text fontSize="sm" color="gray.400" mr={2}>Auto-refresh:</Text>
                        <Switch 
                          size="sm" 
                          isChecked={autoRefresh} 
                          onChange={toggleAutoRefresh} 
                          colorScheme="blue"
                        />
                      </Flex>
                    </Flex>

                    {isLoadingCSV ? (
                      <Flex justify="center" align="center" h="300px">
                        <Spinner size="xl" color="blue.500" />
                        <Text ml={4} color="gray.500">Loading market data...</Text>
                      </Flex>
                    ) : showStockDetail && selectedStock ? (
                      // Stock Detail View
                      <Box className="glass-card" borderRadius="md" p={6}>
                        <Flex justify="space-between" mb={6}>
                          <Heading size="md">{(selectedStock as MarketStock)?.NAME || (selectedStock as PortfolioStock)?.name} ({(selectedStock as MarketStock)?.SYMBOL || (selectedStock as PortfolioStock)?.symbol})</Heading>
                          <Button 
                            leftIcon={<Icon as={FiArrowDown} />} 
                            variant="outline" 
                            size="sm"
                            bg="white"
                            onClick={handleBackToMarket}
                          >
                            Back to Market
                          </Button>
                        </Flex>
                        
                        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} mb={6}>
                          <Box height="450px" p={4} className="glass-card">
                            <Flex justify="space-between" align="center" mb={4}>
                              <Heading size="sm">{(selectedStock as MarketStock)?.NAME || (selectedStock as PortfolioStock)?.name} Chart</Heading>
                              <ButtonGroup size="xs" isAttached variant="outline">
                                <Button onClick={() => setSelectedChartInterval('1D')} colorScheme={selectedChartInterval === '1D' ? 'blue' : undefined}>1D</Button>
                                <Button onClick={() => setSelectedChartInterval('1W')} colorScheme={selectedChartInterval === '1W' ? 'blue' : undefined}>1W</Button>
                                <Button onClick={() => setSelectedChartInterval('1M')} colorScheme={selectedChartInterval === '1M' ? 'blue' : undefined}>1M</Button>
                                <Button onClick={() => setSelectedChartInterval('3M')} colorScheme={selectedChartInterval === '3M' ? 'blue' : undefined}>3M</Button>
                                <Button onClick={() => setSelectedChartInterval('6M')} colorScheme={selectedChartInterval === '6M' ? 'blue' : undefined}>6M</Button>
                                <Button onClick={() => setSelectedChartInterval('1Y')} colorScheme={selectedChartInterval === '1Y' ? 'blue' : undefined}>1Y</Button>
                              </ButtonGroup>
                            </Flex>
                            <EnhancedStockChart 
                              symbol={(selectedStock as MarketStock)?.SYMBOL ? `NSE:${(selectedStock as MarketStock).SYMBOL}` : (selectedStock as PortfolioStock)?.symbol}
                              name={(selectedStock as MarketStock)?.NAME || (selectedStock as PortfolioStock)?.name}
                              currentPrice={(selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice || 0}
                              previousClose={(selectedStock as MarketStock)?.PREV_CLOSE || (selectedStock as PortfolioStock)?.purchasePrice || 0}
                              change={(selectedStock as MarketStock)?.CHANGE || ((selectedStock as PortfolioStock)?.currentPrice || 0) - ((selectedStock as PortfolioStock)?.purchasePrice || 0)}
                              changePercent={(selectedStock as MarketStock)?.CHANGE_PERCENT || ((selectedStock as PortfolioStock)?.profitLossPercentage || 0)}
                              timeInterval={selectedChartInterval}
                              ref={chartRef}
                            />
                          </Box>
                    
                          <Box p={4} className="glass-card">
                            <SimpleGrid columns={2} spacing={6} mb={6}>
                              <Stat>
                                <StatLabel>Current Price</StatLabel>
                                <StatNumber>₹{((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice || 0).toFixed(2)}</StatNumber>
                                <StatHelpText>
                                  <StatArrow type={(selectedStock as MarketStock)?.CHANGE && (selectedStock as MarketStock).CHANGE >= 0 ? 'increase' : 'decrease'} />
                                  {Math.abs((selectedStock as MarketStock)?.CHANGE_PERCENT || 0).toFixed(2)}%
                                </StatHelpText>
                              </Stat>
                              
                              <Stat>
                                <StatLabel>Volume</StatLabel>
                                <StatNumber>{(selectedStock as MarketStock)?.VOLUME || 'N/A'}</StatNumber>
                              </Stat>
                            </SimpleGrid>
                            
                            <Divider my={4} />
                            
                            <SimpleGrid columns={2} spacing={4}>
                              <Box>
                                <Text color="gray.400" mb={1}>Open</Text>
                                <Text fontWeight="medium">₹{chartRef.current?.getOHLC()?.open.toFixed(2) || (selectedStock as MarketStock)?.OPEN?.toFixed(2) || 'N/A'}</Text>
                              </Box>
                              <Box>
                                <Text color="gray.400" mb={1}>Previous Close</Text>
                                <Text fontWeight="medium">₹{chartRef.current?.getOHLC()?.prev_close.toFixed(2) || (selectedStock as MarketStock)?.PREV_CLOSE?.toFixed(2) || 'N/A'}</Text>
                              </Box>
                              <Box>
                                <Text color="gray.400" mb={1}>Day's Low</Text>
                                <Text fontWeight="medium">₹{chartRef.current?.getOHLC()?.low.toFixed(2) || (selectedStock as MarketStock)?.LOW?.toFixed(2) || 'N/A'}</Text>
                              </Box>
                              <Box>
                                <Text color="gray.400" mb={1}>Day's High</Text>
                                <Text fontWeight="medium">₹{chartRef.current?.getOHLC()?.high.toFixed(2) || (selectedStock as MarketStock)?.HIGH?.toFixed(2) || 'N/A'}</Text>
                              </Box>
                            </SimpleGrid>
                            <HStack spacing={4} mt={4} w="100%">
                              <Button 
                                flex={1} 
                                colorScheme="green"
                                leftIcon={<FiTrendingUp />}
                                onClick={() => {
                                  setTransactionType('buy');
                                  onOpen();
                                }}
                              >
                                Buy
                              </Button>
                              <Button 
                                flex={1} 
                                colorScheme="red"
                                leftIcon={<FiTrendingDown />}
                                onClick={() => {
                                  setTransactionType('sell');
                                  onOpen();
                                }}
                              >
                                Sell
                              </Button>
                            </HStack>
                          </Box>
                        </Grid>
                      </Box>
                    ) : filteredStocks.length > 0 ? (
                      // Stock Table View
                      <Box overflowX="auto">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Name</Th>
                              <Th isNumeric>Price</Th>
                              <Th isNumeric>Change</Th>
                              <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                            {filteredStocks.map((stock) => (
                              <Tr key={stock.SYMBOL}>
                                <Td>
                                  <Flex align="center">
                                    <Text fontWeight="medium">{stock.NAME}</Text>
                                    <Badge ml={2} colorScheme={
                                      stock.SECTOR === 'Technology' ? 'blue' :
                                      stock.SECTOR === 'Healthcare' ? 'green' :
                                      stock.SECTOR === 'Financial Services' ? 'purple' :
                                      stock.SECTOR === 'Consumer Goods' ? 'orange' :
                                      stock.SECTOR === 'Energy' ? 'red' :
                                      stock.SECTOR === 'RealEstate' ? 'teal' :
                                      stock.SECTOR === 'Utilities' ? 'cyan' :
                                      stock.SECTOR === 'Industrials' ? 'gray' :
                                      stock.SECTOR === 'Materials' ? 'yellow' :
                                      'pink' // For Telecommunications
                                    } size="sm">
                                      {stock.SYMBOL}
                                    </Badge>
                                  </Flex>
                                </Td>
                                <Td isNumeric>₹{stock.PRICE.toFixed(2)}</Td>
                                <Td isNumeric>
                                  <Text color={stock.CHANGE >= 0 ? 'green.400' : 'red.400'}>
                                    {stock.CHANGE >= 0 ? '+' : ''}{stock.CHANGE.toFixed(2)} ({stock.CHANGE >= 0 ? '+' : ''}{stock.CHANGE_PERCENT.toFixed(2)}%)
                                  </Text>
                                </Td>
                                <Td>
                              <Button
                                size="xs"
                                colorScheme="teal"
                                onClick={() => handleStockSelection(stock)}
                              >
                                Trade
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                      </Box>
                    ) : (
                      // No stocks message - will be updated for yfinance
                      <Box textAlign="center" p={10}>
                        <Icon as={FiAlertCircle} boxSize={10} color="gray.500" mb={4} />
                        <Heading size="md" mb={2}>Market Data Loading</Heading>
                        <Text>Market data will be loaded using yfinance integration.</Text>
                        <Button mt={4} onClick={() => setLoading(true)} leftIcon={<FiRefreshCw />}>
                          Refresh Data
                        </Button>
                      </Box>
                    )}
                  </Box>
                </TabPanel>

                {/* Allocation Tab */}
                <TabPanel p={0}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box className="glass-card" p={6}>
                      <Heading size="sm" mb={6}>Sector Allocation</Heading>
                      <Flex direction="column" align="center">
                        <Box height="250px" width="250px" mb={6}>
                          {/* This would be a pie chart in a full implementation */}
                          <StockChart 
                            symbol="NSE:NIFTY50"
                            companyName="Sector Allocation"
                            period="1M"
                          />
                        </Box>
                        
                        <VStack spacing={2} align="stretch" width="100%">
                          {allocations.map((item) => (
                            <Flex key={item.name} justify="space-between" align="center">
                              <Flex align="center">
                                <Box 
                                  width="12px" 
                                  height="12px" 
                                  borderRadius="full" 
                                  bg={item.color} 
                                  mr={2} 
                                />
                                <Text fontSize="sm">{item.name}</Text>
                              </Flex>
                              <Text fontSize="sm" fontWeight="medium">{item.value}%</Text>
                            </Flex>
                          ))}
                        </VStack>
                      </Flex>
                    </Box>

                    <Box className="glass-card" p={6}>
                      <Heading size="sm" mb={6}>Risk Analysis</Heading>
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Flex justify="space-between" mb={2}>
                            <Text fontSize="sm">Portfolio Risk Level</Text>
                            <Text fontSize="sm" fontWeight="medium">Moderate</Text>
                          </Flex>
                          <Progress value={65} size="sm" colorScheme="orange" borderRadius="full" />
                        </Box>
                        
                        <Box>
                          <Flex justify="space-between" mb={2}>
                            <Text fontSize="sm">Diversification Score</Text>
                            <Text fontSize="sm" fontWeight="medium">7.5/10</Text>
                          </Flex>
                          <Progress value={75} size="sm" colorScheme="blue" borderRadius="full" />
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" mb={4}>Recommendations to Improve Portfolio</Text>
                          <VStack spacing={3} align="stretch">
                            <Flex className="glass-card" p={3} borderLeft="4px solid" borderColor="yellow.400">
                              <Icon as={FiAlertCircle} color="yellow.400" mr={3} mt={0.5} />
                              <Text fontSize="sm">Consider adding more defensive stocks to balance your technology-heavy portfolio.</Text>
                            </Flex>
                            <Flex className="glass-card" p={3} borderLeft="4px solid" borderColor="blue.400">
                              <Icon as={FiAlertCircle} color="blue.400" mr={3} mt={0.5} />
                              <Text fontSize="sm">Your portfolio has potential for high growth but also increased volatility.</Text>
                            </Flex>
                            <Flex className="glass-card" p={3} borderLeft="4px solid" borderColor="green.400">
                              <Icon as={FiAlertCircle} color="green.400" mr={3} mt={0.5} />
                              <Text fontSize="sm">Explore adding fixed-income assets to reduce overall portfolio risk.</Text>
                            </Flex>
                          </VStack>
                        </Box>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Container>
      </Box>

      {/* Stock Transaction Modal - Increased size for better layout */}
      {selectedStock && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bg="darkBlue.800" color="white" maxW="1000px">
            <ModalHeader>
              <Flex align="center">
                <Text>{(selectedStock as MarketStock)?.NAME || (selectedStock as PortfolioStock)?.name} ({(selectedStock as MarketStock)?.SYMBOL || (selectedStock as PortfolioStock)?.symbol})</Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody p={6}>
              {/* Chart Section - Completely Separate */}
              <Box className="glass-card" p={4} mb={8} borderRadius="md">
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm">{(selectedStock as MarketStock)?.NAME || (selectedStock as PortfolioStock)?.name} Chart</Heading>
                  <ButtonGroup size="xs" isAttached variant="outline">
                    <Button onClick={() => setSelectedChartInterval('1D')} colorScheme={selectedChartInterval === '1D' ? 'blue' : 'red'}>1D</Button>
                    <Button onClick={() => setSelectedChartInterval('1W')} colorScheme={selectedChartInterval === '1W' ? 'blue' : 'red'}>1W</Button>
                    <Button onClick={() => setSelectedChartInterval('1M')} colorScheme={selectedChartInterval === '1M' ? 'blue' : 'red'}>1M</Button>
                    <Button onClick={() => setSelectedChartInterval('3M')} colorScheme={selectedChartInterval === '3M' ? 'blue' : 'red'}>3M</Button>
                    <Button onClick={() => setSelectedChartInterval('6M')} colorScheme={selectedChartInterval === '6M' ? 'blue' : 'red'}>6M</Button>
                    <Button onClick={() => setSelectedChartInterval('1Y')} colorScheme={selectedChartInterval === '1Y' ? 'blue' : 'red'}>1Y</Button>
                  </ButtonGroup>
                </Flex>
                <Box height="500px" width="100%" mb={4} overflow="auto">
                  <EnhancedStockChart 
                    symbol={(selectedStock as MarketStock)?.SYMBOL ? `NSE:${(selectedStock as MarketStock).SYMBOL}` : (selectedStock as PortfolioStock)?.symbol}
                    name={(selectedStock as MarketStock)?.NAME || (selectedStock as PortfolioStock)?.name}
                    currentPrice={(selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice || 0}
                    previousClose={(selectedStock as MarketStock)?.PREV_CLOSE || (selectedStock as PortfolioStock)?.purchasePrice || 0}
                    change={(selectedStock as MarketStock)?.CHANGE || ((selectedStock as PortfolioStock)?.currentPrice || 0) - ((selectedStock as PortfolioStock)?.purchasePrice || 0)}
                    changePercent={(selectedStock as MarketStock)?.CHANGE_PERCENT || ((selectedStock as PortfolioStock)?.profitLossPercentage || 0)}
                    timeInterval={selectedChartInterval}
                  />
                </Box>
              </Box>
              
              {/* Price and Trade Section */}
              <SimpleGrid columns={2} spacing={6} mb={6}>
                {/* Price Card */}
                <Box className="glass-card" p={4} borderRadius="md">
                  <Heading size="sm" mb={4}>Current Price</Heading>
                  <VStack spacing={4} align="stretch">
                    <Stat>
                      <StatLabel>Share Price</StatLabel>
                      <StatNumber>₹{
                        selectedStock 
                          ? (((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice) || 0).toFixed(2)
                          : 'N/A'
                      }</StatNumber>
                    </Stat>
                    <HStack>
                      <Button 
                        flex={1} 
                        colorScheme={transactionType === 'buy' ? 'green' : 'gray'}
                        variant={transactionType === 'buy' ? 'solid' : 'outline'}
                        onClick={() => setTransactionType('buy')}
                        leftIcon={<FiTrendingUp />}
                      >
                        Buy
                      </Button>
                      <Button 
                        flex={1} 
                        colorScheme={transactionType === 'sell' ? 'red' : 'gray'}
                        variant={transactionType === 'sell' ? 'solid' : 'outline'}
                        onClick={() => setTransactionType('sell')}
                        leftIcon={<FiTrendingDown />}
                      >
                        Sell
                      </Button>
                    </HStack>
                  </VStack>
                </Box>

                {/* OHLC Card */}
                <Box className="glass-card" p={4} borderRadius="md">
                  <Heading size="sm" mb={4}>Order Details</Heading>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Amount to {transactionType === 'buy' ? 'Invest' : 'Sell'}</FormLabel>
                      <NumberInput 
                        value={buyAmount}
                        onChange={(valueString) => setBuyAmount(parseFloat(valueString))}
                        min={100}
                        max={portfolio.cash}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Order Type</FormLabel>
                      <Select defaultValue="market" bg="whiteAlpha.100">
                        <option value="market">Market Order</option>
                        <option value="limit">Limit Order</option>
                        <option value="stop">Stop Order</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </Box>
              </SimpleGrid>

              {/* Order Summary */}
              <Box className="glass-card" p={4} borderRadius="md">
                <Heading size="sm" mb={4}>Order Summary</Heading>
                <Box p={4} bg="whiteAlpha.100" borderRadius="md">
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm">Estimated Shares</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {selectedStock && ((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice) 
                        ? Math.floor(buyAmount / ((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice || 1))
                        : 0} shares
                    </Text>
                  </Flex>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm">Estimated Cost</Text>
                    <Text fontSize="sm">₹{
                      selectedStock && ((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice)
                        ? (Math.floor(buyAmount / ((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice || 1)) 
                           * ((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice || 0)).toFixed(2)
                        : '0.00'
                    }</Text>
                  </Flex>
                  <Divider my={2} borderColor="whiteAlpha.300" />
                  <Flex justify="space-between">
                    <Text fontSize="sm" fontWeight="bold">Remaining Cash</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      ₹{
                        selectedStock && ((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice)
                          ? (portfolio.cash - (Math.floor(buyAmount / ((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice || 1)) 
                             * ((selectedStock as MarketStock)?.PRICE || (selectedStock as PortfolioStock)?.currentPrice || 0))).toFixed(2)
                          : portfolio.cash.toFixed(2)
                      }
                    </Text>
                  </Flex>
                </Box>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose} variant="outline" color="white">
                Cancel
              </Button>
              <Button 
                colorScheme={transactionType === 'buy' ? 'green' : 'red'} 
                onClick={handleTransaction}
              >
                {transactionType === 'buy' ? 'Buy' : 'Sell'} {(selectedStock as MarketStock)?.SYMBOL || (selectedStock as PortfolioStock)?.symbol}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default SimulatorPage; 