import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Button, HStack, VStack, Icon, SimpleGrid, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Select, Badge, Avatar, Divider, Progress, Spinner, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiFilter, FiStar, FiDollarSign, FiTrendingUp, FiShield, FiBarChart2, FiInfo, FiExternalLink, FiHeart, FiCompass } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';
import StockChart from '../components/StockChart';
import ProtectedFeature from '../components/ProtectedFeature';
import { getTrendingStocks, getMarketNews, TrendingStock, getIndianTrendingStocks, getIndianMarketNews, CURRENCY_SYMBOL } from '../services/finnhubService';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const DiscoveryPage: React.FC = () => {
  const [riskLevel, setRiskLevel] = useState<number>(3);
  const [investmentType, setInvestmentType] = useState<string>('all');
  const [investmentTerm, setInvestmentTerm] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [marketNews, setMarketNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const toast = useToast();

  // Load real-time data when component mounts
  useEffect(() => {
    const loadTrendingStocks = async () => {
      setIsLoadingStocks(true);
      try {
        // Get trending Indian stocks from yfinance server
        const stocks = await getIndianTrendingStocks();
        console.log('Fetched trending Indian stocks:', stocks);
        
        if (stocks && stocks.length > 0) {
          setTrendingStocks(stocks);
        } else {
          console.warn('No trending Indian stocks returned from API');
        }
      } catch (error) {
        console.error('Error fetching trending Indian stocks:', error);
        toast({
          title: "Could not load trending stocks",
          description: "There was an issue fetching NSE market data. Using preloaded recommendations instead.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingStocks(false);
      }
    };

    const loadMarketNews = async () => {
      setIsLoadingNews(true);
      try {
        // Get market news with focus on Indian market
        const news = await getIndianMarketNews(5);
        console.log('Fetched Indian market news:', news);
        
        if (news && news.length > 0) {
          setMarketNews(news);
        } else {
          console.warn('No market news returned from API');
        }
      } catch (error) {
        console.error('Error fetching market news:', error);
      } finally {
        setIsLoadingNews(false);
      }
    };

    loadTrendingStocks();
    loadMarketNews();
  }, [toast]);

  // Generate real stock recommendations based on risk level
  const generateStockRecommendations = () => {
    if (trendingStocks.length === 0) return [];

    // Make a copy to avoid modifying original array
    const stocks = [...trendingStocks];

    // Filter based on risk tolerance
    let filteredStocks = stocks;
    if (riskLevel <= 2) {
      // Conservative: Low volatility stocks with stable performance
      filteredStocks = stocks.filter(stock => Math.abs(stock.percentChange) < 1.5);
    } else if (riskLevel >= 4) {
      // Aggressive: Higher volatility stocks with potential for larger gains
      filteredStocks = stocks.filter(stock => Math.abs(stock.percentChange) > 0.5);
    }

    // If no stocks match criteria, fallback to all stocks
    if (filteredStocks.length === 0) {
      filteredStocks = stocks;
    }

    // Convert TrendingStock objects to product format
    return filteredStocks.map(stock => ({
      id: stock.symbol,
      name: stock.name || stock.symbol,
      type: 'stock',
      company: stock.name || stock.symbol,
      logoUrl: `https://finnhub.io/api/logo?symbol=${stock.symbol}`,
      risk: Math.min(5, Math.max(1, Math.ceil(Math.abs(stock.percentChange)))),
      term: 'medium',
      returnRate: { 
        '1d': parseFloat(stock.percentChange.toFixed(2)), 
        '1y': parseFloat((stock.percentChange * 5).toFixed(2)), // Simulated yearly projection
        '5y': parseFloat((stock.percentChange * 15).toFixed(2)), // Simulated 5-year projection
      },
      description: `${stock.name || stock.symbol} stock trading at ${CURRENCY_SYMBOL}${stock.currentPrice.toFixed(2)} with a market cap of ${(stock.marketCap ? (stock.marketCap / 1000000000).toFixed(2) + 'B' : 'N/A')}.`,
      tags: [stock.percentChange > 0 ? 'Gaining' : 'Declining', 'Individual Stock', stock.marketCap && stock.marketCap > 100000000000 ? 'Large Cap' : 'Mid Cap'],
      rating: 3 + (stock.percentChange > 0 ? 1.5 : -0.5),
      holdings: [],
      minInvestment: 0,
      expenseRatio: 0,
      popularity: Math.round(70 + Math.random() * 20),
      currentPrice: stock.currentPrice,
      change: stock.change,
      percentChange: stock.percentChange
    }));
  };

  // Get all products - use only stock recommendations from the yfinance server
  const getAllProducts = () => {
    return generateStockRecommendations();
  };

  // Combine static fund products with real stock recommendations
  // const getAllProducts = () => {
  //   const stockRecommendations = generateStockRecommendations();
  //   return [...products, ...stockRecommendations];
  // };

  // Filter products based on selected criteria
  const filteredProducts = getAllProducts().filter(product => {
    if (investmentType !== 'all' && product.type !== investmentType) return false;
    if (investmentTerm !== 'all' && product.term !== investmentTerm) return false;
    
    // Risk tolerance: allow products with risk level equal to or below selected risk
    if (product.risk > riskLevel) return false;
    
    return true;
  });

  // Sort products by rating (high to low)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Convert any string ratings to numbers for comparison
    const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : a.rating;
    const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : b.rating;
    return ratingB - ratingA;
  });

  // Map risk level to text
  const getRiskLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Very Conservative';
      case 2: return 'Conservative';
      case 3: return 'Moderate';
      case 4: return 'Aggressive';
      case 5: return 'Very Aggressive';
      default: return 'Moderate';
    }
  };

  // Header gradient for discovery page
  const discoveryGradient = "linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)";

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
          bgGradient={discoveryGradient}
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
        
        {/* Decorative discover icon */}
        <MotionBox
          position="absolute"
          top="0"
          right="20px"
          opacity="0.2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Icon as={FiCompass} color="white" boxSize="80px" />
        </MotionBox>
      </Box>
      
      <Box as="main" pt="120px">
        <Container maxW="container.xl" px={4}>
          {/* Header Section */}
          <Box mb={8} textAlign="center" position="relative">
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              position="absolute"
              top="-30px"
              left="50%"
              transform="translateX(-50%)"
              width="150px"
              height="150px"
              borderRadius="full"
              bg="rgba(245, 158, 11, 0.1)"
              filter="blur(25px)"
              zIndex="-1"
            />
            
            <Heading as="h1" size="xl" mb={4} className="text-gradient" display="inline-flex" alignItems="center">
              <Icon as={FiCompass} mr={3} />
              Discover Investment Opportunities
            </Heading>
            
            <Text fontSize="lg" opacity={0.8} maxW="800px" mx="auto">
              Find personalized investment recommendations based on your risk tolerance, investment goals,
              and time horizon. Our AI analyzes thousands of options to match you with the best choices.
            </Text>
          </Box>

          {/* Main Content */}
          <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
            {/* Filters Panel */}
            <GridItem>
              <ProtectedFeature
                featureName="Investment Discovery"
                fallback={
                  <MotionBox
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card"
                    p={6}
                    display={{ base: showFilters ? 'block' : 'none', lg: 'block' }}
                    position={{ lg: 'sticky' }}
                    top={{ lg: '100px' }}
                    textAlign="center"
                  >
                    <Icon as={FiCompass} boxSize={12} color="orange.400" mb={4} />
                    <Heading size="md" mb={2}>Discover Investments</Heading>
                    <Text mb={4}>Sign in to discover personalized investment opportunities based on your profile.</Text>
                    <Button colorScheme="orange">Sign In to Discover</Button>
                  </MotionBox>
                }
              >
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="glass-card"
                  p={6}
                  display={{ base: showFilters ? 'block' : 'none', lg: 'block' }}
                  position={{ lg: 'sticky' }}
                  top={{ lg: '100px' }}
                >
                  <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="md">
                      <Flex align="center">
                        <Icon as={FiFilter} mr={2} />
                        Investment Filters
                      </Flex>
                    </Heading>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      display={{ base: 'block', lg: 'none' }}
                      onClick={() => setShowFilters(false)}
                    >
                      Close
                    </Button>
                  </Flex>

                  <VStack spacing={6} align="stretch">
                    {/* Risk Tolerance Slider */}
                    <Box>
                      <Text fontWeight="medium" mb={2}>Risk Tolerance</Text>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.400">Conservative</Text>
                        <Text fontSize="sm" color="gray.400">Aggressive</Text>
                      </Flex>
                      <Slider 
                        min={1} 
                        max={5} 
                        step={1} 
                        value={riskLevel} 
                        onChange={val => setRiskLevel(val)}
                        colorScheme="blue"
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={6} bg="brand.500">
                          <Box fontSize="xs" color="white">{riskLevel}</Box>
                        </SliderThumb>
                      </Slider>
                      <Text mt={2} fontSize="sm" fontWeight="medium">
                        Selected: <span className="text-gradient">{getRiskLevelText(riskLevel)}</span>
                      </Text>
                    </Box>

                    {/* Investment Type */}
                    <Box>
                      <Text fontWeight="medium" mb={2}>Investment Type</Text>
                      <Select 
                        bg="whiteAlpha.100" 
                        border="none" 
                        value={investmentType}
                        onChange={(e) => setInvestmentType(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="mutual-fund">Mutual Funds</option>
                        <option value="etf">ETFs</option>
                        <option value="index-fund">Index Funds</option>
                        <option value="stock">Individual Stocks</option>
                      </Select>
                    </Box>

                    {/* Investment Term */}
                    <Box>
                      <Text fontWeight="medium" mb={2}>Investment Term</Text>
                      <Select 
                        bg="whiteAlpha.100" 
                        border="none"
                        value={investmentTerm}
                        onChange={(e) => setInvestmentTerm(e.target.value)}
                      >
                        <option value="all">Any Term</option>
                        <option value="short">Short Term (&lt; 2 years)</option>
                        <option value="medium">Medium Term (2-5 years)</option>
                        <option value="long">Long Term (5+ years)</option>
                      </Select>
                    </Box>

                    <Divider borderColor="whiteAlpha.300" />

                    {/* AI Recommendations */}
                    <Box p={4} bg="whiteAlpha.100" borderRadius="md">
                      <Flex align="center" mb={3}>
                        <Icon as={FiInfo} color="blue.400" mr={2} />
                        <Text fontWeight="medium">AI Recommendation</Text>
                      </Flex>
                      <Text fontSize="sm" opacity={0.8} mb={3}>
                        Based on your profile and market conditions, we recommend:
                      </Text>
                      <VStack align="stretch" spacing={3}>
                        <Flex justify="space-between">
                          <Text fontSize="sm">Stocks</Text>
                          <Text fontSize="sm" fontWeight="medium">40%</Text>
                        </Flex>
                        <Progress value={40} size="sm" colorScheme="blue" borderRadius="full" mb={1} />
                        
                        <Flex justify="space-between">
                          <Text fontSize="sm">Bonds</Text>
                          <Text fontSize="sm" fontWeight="medium">30%</Text>
                        </Flex>
                        <Progress value={30} size="sm" colorScheme="purple" borderRadius="full" mb={1} />
                        
                        <Flex justify="space-between">
                          <Text fontSize="sm">ETFs</Text>
                          <Text fontSize="sm" fontWeight="medium">20%</Text>
                        </Flex>
                        <Progress value={20} size="sm" colorScheme="green" borderRadius="full" mb={1} />
                        
                        <Flex justify="space-between">
                          <Text fontSize="sm">Cash</Text>
                          <Text fontSize="sm" fontWeight="medium">10%</Text>
                        </Flex>
                        <Progress value={10} size="sm" colorScheme="orange" borderRadius="full" mb={1} />
                      </VStack>
                    </Box>
                  </VStack>
                </MotionBox>
              </ProtectedFeature>

              {/* Mobile Filter Toggle */}
              <Button 
                leftIcon={<FiFilter />}
                variant="solid"
                w="full"
                display={{ base: showFilters ? 'none' : 'flex', lg: 'none' }}
                onClick={() => setShowFilters(true)}
                mb={4}
              >
                Show Filters
              </Button>
            </GridItem>

            {/* Products Results */}
            <GridItem>
              <Box display={{ base: 'flex', lg: 'none' }} justifyContent="flex-end" mb={4}>
                <Button 
                  leftIcon={<FiFilter />} 
                  colorScheme="orange" 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
              </Box>

              {/* Live Market Trends Section */}
              <Box mb={8}>
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiTrendingUp} mr={2} color="orange.300" />
                  Live Market Trends
                </Heading>

                {isLoadingStocks ? (
                  <Flex justify="center" align="center" h="100px">
                    <Spinner color="orange.400" mr={3} />
                    <Text>Loading market data...</Text>
                  </Flex>
                ) : trendingStocks && trendingStocks.length > 0 ? (
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={6}>
                    {trendingStocks.slice(0, 5).map((stock) => (
                      <Box 
                        key={stock.symbol} 
                        p={3} 
                        borderRadius="md" 
                        bg="whiteAlpha.100"
                        _hover={{ bg: "whiteAlpha.200" }}
                        transition="all 0.2s"
                      >
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontWeight="bold">{stock.symbol}</Text>
                          <Badge colorScheme={stock.percentChange > 0 ? "green" : "red"}>
                            {stock.percentChange > 0 ? "+" : ""}{stock.percentChange.toFixed(2)}%
                          </Badge>
                        </Flex>
                        <Text fontSize="sm" color="gray.400" noOfLines={1}>{stock.name || stock.symbol}</Text>
                        <Text fontWeight="medium" mt={2}>{CURRENCY_SYMBOL}{stock.currentPrice.toFixed(2)}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box p={4} bg="gray.800" borderRadius="md" textAlign="center">
                    <Text>No market data available right now.</Text>
                  </Box>
                )}
              </Box>

              {/* Recommendations Results */}
              <Heading size="md" mb={4}>
                Recommended for You
                <Badge ml={2} colorScheme="blue" fontSize="xs" px={2} py={1}>
                  {sortedProducts.length} matches
                </Badge>
              </Heading>

              {sortedProducts.length > 0 ? (
                <>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
                    {sortedProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </SimpleGrid>
                </>
              ) : (
                <Box p={6} bg="gray.800" borderRadius="md" textAlign="center">
                  <Icon as={FiFilter} boxSize={10} color="gray.500" mb={4} />
                  <Heading size="md" mb={2}>No matches found</Heading>
                  <Text mb={4}>Try adjusting your filters to see more investment options</Text>
                  <Button colorScheme="blue" onClick={() => {
                    setRiskLevel(3);
                    setInvestmentType('all');
                    setInvestmentTerm('all');
                  }}>Reset Filters</Button>
                </Box>
              )}

              {/* Latest Market News Section */}
              <Box mt={10}>
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiBarChart2} mr={2} color="blue.300" />
                  Latest Market Insights
                </Heading>

                {isLoadingNews ? (
                  <Flex justify="center" align="center" h="100px">
                    <Spinner color="blue.400" mr={3} />
                    <Text>Loading market news...</Text>
                  </Flex>
                ) : marketNews && marketNews.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {marketNews.map((article, index) => (
                      <Box 
                        key={article.id || index} 
                        p={4} 
                        borderRadius="md" 
                        bg="whiteAlpha.100"
                        _hover={{ bg: "whiteAlpha.200" }}
                      >
                        <Flex>
                          {article.image && (
                            <Box 
                              width="100px" 
                              height="70px" 
                              borderRadius="md" 
                              overflow="hidden" 
                              mr={4}
                              display={{ base: 'none', sm: 'block' }}
                            >
                              <img 
                                src={article.image} 
                                alt={article.headline} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </Box>
                          )}
                          <Box flex="1">
                            <Heading size="sm" mb={1}>{article.headline}</Heading>
                            <Text fontSize="sm" color="gray.400" mb={2}>
                              {article.source} • {new Date(article.datetime * 1000).toLocaleDateString()}
                            </Text>
                            <Text fontSize="sm" noOfLines={2}>{article.summary}</Text>
                            <Button 
                              as="a" 
                              href={article.url} 
                              target="_blank" 
                              size="sm" 
                              variant="link" 
                              colorScheme="blue" 
                              mt={2}
                              rightIcon={<FiExternalLink />}
                            >
                              Read more
                            </Button>
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Box p={4} bg="gray.800" borderRadius="md" textAlign="center">
                    <Text>No market news available right now.</Text>
                  </Box>
                )}
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

interface ProductCardProps {
  product: any;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <AnimatedCard p={0}>
        <Box p={4}>
          <Flex justify="space-between" mb={3}>
            <HStack>
              <Avatar 
                src={product.logoUrl} 
                size="sm" 
                bg="gray.700" 
                icon={<FiDollarSign size={16} />} 
              />
              <Box>
                <Heading size="sm">{product.name}</Heading>
                <Text fontSize="xs" color="gray.400">{product.company}</Text>
              </Box>
            </HStack>
            
            <Badge 
              colorScheme={product.type === 'stock' ? (product.percentChange > 0 ? 'green' : 'red') : 
                product.risk <= 2 ? 'green' : product.risk >= 4 ? 'red' : 'yellow'} 
              fontSize="xs"
            >
              {product.type === 'stock' ? 
                `${product.percentChange > 0 ? '+' : ''}${product.percentChange?.toFixed(2)}%` : 
                `Risk: ${product.risk}/5`}
            </Badge>
          </Flex>

          {product.type === 'stock' && (
            <Flex mb={3} align="center">
              <Text fontSize="lg" fontWeight="bold">{CURRENCY_SYMBOL}{product.currentPrice?.toFixed(2)}</Text>
              <Badge ml={2} colorScheme={product.change > 0 ? 'green' : 'red'}>
                {product.change > 0 ? '+' : ''}{product.change?.toFixed(2)}
              </Badge>
            </Flex>
          )}
          
          <Text fontSize="sm" noOfLines={2} mb={3}>{product.description}</Text>
          
          <Flex wrap="wrap" mb={3} gap={2}>
            {product.tags.map((tag: string, i: number) => (
              <Badge key={i} colorScheme="blue" variant="subtle" fontSize="xs">
                {tag}
              </Badge>
            ))}
          </Flex>
          
          <Divider mb={3} />
          
          <SimpleGrid columns={3} gap={2} mb={3}>
            <Box>
              <Text fontSize="xs" color="gray.400">Rating</Text>
              <HStack>
                <Icon as={FiStar} color="yellow.400" boxSize={3} />
                <Text fontWeight="bold" fontSize="sm">{product.rating}</Text>
              </HStack>
            </Box>
            
            {product.type !== 'stock' && (
              <>
                <Box>
                  <Text fontSize="xs" color="gray.400">Expense Ratio</Text>
                  <Text fontWeight="bold" fontSize="sm">{product.expenseRatio}%</Text>
                </Box>
                
                <Box>
                  <Text fontSize="xs" color="gray.400">Min Investment</Text>
                  <Text fontWeight="bold" fontSize="sm">
                    {product.minInvestment === 0 ? 'None' : `$${product.minInvestment}`}
                  </Text>
                </Box>
              </>
            )}
            
            {product.type === 'stock' && (
              <>
                <Box>
                  <Text fontSize="xs" color="gray.400">1D Return</Text>
                  <Text 
                    fontWeight="bold" 
                    fontSize="sm"
                    color={product.returnRate['1d'] > 0 ? 'green.400' : 'red.400'}
                  >
                    {product.returnRate['1d'] > 0 ? '+' : ''}{product.returnRate['1d']}%
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="xs" color="gray.400">Market Cap</Text>
                  <Text fontWeight="bold" fontSize="sm">
                    {product.marketCap ? `$${(product.marketCap / 1000000000).toFixed(1)}B` : 'N/A'}
                  </Text>
                </Box>
              </>
            )}
          </SimpleGrid>
          
          {product.type !== 'stock' && product.holdings && product.holdings.length > 0 && (
            <Box mb={3}>
              <Text fontSize="xs" color="gray.400" mb={1}>Top Holdings</Text>
              <HStack spacing={2}>
                {product.holdings.slice(0, 3).map((holding: any, i: number) => (
                  <Badge key={i} variant="outline" fontSize="xs">
                    {holding.name} {holding.allocation}%
                  </Badge>
                ))}
              </HStack>
            </Box>
          )}
          
          <Flex justify="space-between" align="center" mt={2}>
            <HStack>
              <Icon as={FiBarChart2} color="blue.400" />
              <Text fontSize="sm" color="blue.400">View Details</Text>
            </HStack>
            
            <Button 
              size="sm" 
              colorScheme="blue" 
              rightIcon={<FiHeart />}
            >
              Add to Watchlist
            </Button>
          </Flex>
        </Box>
      </AnimatedCard>
    </MotionBox>
  );
};

export default DiscoveryPage;