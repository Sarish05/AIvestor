import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Heading, Text, Flex, Button, Grid, GridItem, 
  HStack, VStack, Icon, Spinner, Select, Badge, 
  useToast, Image, Divider
} from '@chakra-ui/react';
import { 
  FiFileText, FiTrendingUp, FiClock, FiExternalLink, 
  FiFilter, FiRefreshCw, FiInfo, FiChevronDown, FiBarChart2
} from 'react-icons/fi';
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const finnhubApiKey = process.env.REACT_APP_FINNHUB_API_KEY || 'cvoka11r01qihjtp7vugcvoka11r01qihjtp7vv0';
  const newsTimerRef = useRef<number | null>(null);
  const toast = useToast();

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'forex', name: 'Forex' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'merger', name: 'Mergers' },
    { id: 'earnings', name: 'Earnings' }
  ];

  // Fetch initial data and set up intervals
  useEffect(() => {
    // Fetch initial data
    fetchMarketNews();
    
    // Set up interval for news updates (every 30 seconds)
    const newsIntervalId = window.setInterval(() => {
      fetchMarketNews();
      setLastUpdated(new Date());
    }, 30000);
    
    newsTimerRef.current = newsIntervalId;

    // Clean up on component unmount
    return () => {
      if (newsTimerRef.current) {
        window.clearInterval(newsTimerRef.current);
      }
    };
  }, [selectedCategory]);

  // Enhanced error handling for API calls
  async function fetchWithErrorHandling(url: string, options = {}) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: 'API Error',
        description: `Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }

  async function fetchMarketNews() {
    setIsLoading(true);
    
    try {
      // Fetch market news
      const data = await fetchWithErrorHandling(`https://finnhub.io/api/v1/news?category=${selectedCategory}&token=${finnhubApiKey}`);
      
      if (data && Array.isArray(data)) {
        // Sort news by datetime (newest first)
        const sortedNews = data.sort((a, b) => b.datetime - a.datetime);
        setNews(sortedNews.slice(0, 20)); // Limit to 20 articles
        
        // Show success toast when news is loaded
        if (lastUpdated) {  // Only show toast after initial load
          toast({
            title: 'News Updated',
            description: 'Latest market news has been loaded',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
        
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching market news:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box minH="100vh" bg="gray.900">
      <Navigation />
      
      <Container maxW="container.xl" pt="100px" pb="40px">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 300px' }} gap={6}>
          {/* News Section */}
          <GridItem>
            <AnimatedCard delay={0.1}>
              <Box p={6} borderRadius="lg" bg="rgba(26, 32, 44, 0.7)" backdropFilter="blur(10px)">
                <Flex align="center" justify="space-between" mb={6}>
                  <Heading size="lg" display="flex" alignItems="center">
                    <Icon as={FiFileText} boxSize={6} mr={3} color="blue.400" />
                    Market News
                  </Heading>
                  
                  <Flex>
                    <Box
                      rounded="full"
                      bg="gray.800"
                      borderRadius="md"
                      p={1}
                      pl={3}
                      borderWidth="1px"
                      borderColor="gray.600"
                    >
                      <Flex align="center">
                        <Icon as={FiFilter} boxSize={4} color="blue.400" mr={2} />
                        <Text color="gray.300" fontSize="sm" fontWeight="medium" mr={2}>Category:</Text>
                        <Select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          bg="transparent"
                          border="none"
                          color="white"
                          fontWeight="medium"
                          size="sm"
                          w="120px"
                          _focus={{ boxShadow: "none" }}
                          icon={<Icon as={FiChevronDown} color="blue.400" />}
                          sx={{
                            "& option": {
                              bg: "gray.800",
                              color: "white"
                            }
                          }}
                        >
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>

                {lastUpdated && (
                  <Flex align="center" justify="space-between" mb={4}>
                    <Text fontSize="sm" color="gray.400">
                      Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
                    </Text>
                    <Button 
                      leftIcon={<Icon as={FiRefreshCw} />}
                      onClick={() => fetchMarketNews()}
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                    >
                      Refresh
                    </Button>
                  </Flex>
                )}
                
                {isLoading ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="xl" color="blue.400" thickness="4px" />
                  </Flex>
                ) : news.length === 0 ? (
                  <Flex 
                    direction="column" 
                    align="center" 
                    justify="center" 
                    py={10} 
                    bg="rgba(26, 32, 44, 0.4)" 
                    borderRadius="md"
                  >
                    <Icon as={FiInfo} boxSize={8} color="gray.500" mb={4} />
                    <Heading size="md" mb={2}>No News Available</Heading>
                    <Text color="gray.400" textAlign="center">
                      There are no news articles for the selected category at this time.
                    </Text>
                    <Button 
                      mt={6} 
                      leftIcon={<Icon as={FiRefreshCw} />}
                      onClick={() => fetchMarketNews()}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                    >
                      Refresh News
                    </Button>
                  </Flex>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {news.map((item) => (
                      <Box 
                        key={item.id} 
                        bg="rgba(26, 32, 44, 0.4)" 
                        p={4} 
                        borderRadius="md" 
                        borderLeft="3px solid" 
                        borderLeftColor="blue.400"
                        _hover={{ bg: "rgba(26, 32, 44, 0.6)" }}
                        transition="all 0.2s"
                      >
                        <Grid templateColumns={{ base: '1fr', md: '1fr auto' }} gap={4}>
                          <Box>
                            <Flex align="center" mb={2}>
                              <Badge colorScheme="blue" mr={2}>{item.category}</Badge>
                              <Text fontSize="xs" color="gray.400">
                                {format(new Date(item.datetime * 1000), 'MMM d, yyyy')} • {item.source}
                              </Text>
                            </Flex>
                            
                            <Heading size="sm" mb={2}>{item.headline}</Heading>
                            
                            <Text fontSize="sm" color="gray.300" mb={3} noOfLines={2}>
                              {item.summary}
                            </Text>
                            
                            <Button 
                              as="a" 
                              href={item.url} 
                              target="_blank" 
                              size="xs" 
                              colorScheme="blue" 
                              variant="outline"
                              rightIcon={<Icon as={FiExternalLink} />}
                            >
                              Read Full Article
                            </Button>
                          </Box>
                          
                          {item.image && (
                            <Box 
                              w={{ base: "100%", md: "150px" }} 
                              h="100px" 
                              overflow="hidden" 
                              borderRadius="md"
                            >
                              <Image 
                                src={item.image} 
                                alt={item.headline} 
                                w="100%" 
                                h="100%" 
                                objectFit="cover"
                                fallback={<Box bg="gray.700" w="100%" h="100%" />}
                              />
                            </Box>
                          )}
                        </Grid>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </AnimatedCard>
          </GridItem>
          
          {/* Market Resources */}
          <GridItem>
            <AnimatedCard delay={0.2}>
              <Box p={6} borderRadius="lg" bg="rgba(26, 32, 44, 0.7)" backdropFilter="blur(10px)" h="100%">
                <Box mt={6}>
                  <Divider mb={4} />
                  <Heading size="md" mb={4} color="white">Market Resources</Heading>
                  <VStack spacing={3} align="stretch">
                    <Button
                      as="a"
                      href="https://www.nasdaq.com/market-activity/earnings"
                      target="_blank"
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiClock} color="yellow.400" />}
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200', color: 'yellow.400' }}
                    >
                      Earnings Calendar
                    </Button>
                    <Button
                      as="a"
                      href="https://www.nasdaq.com/market-activity/ipos"
                      target="_blank"
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiTrendingUp} color="green.400" />}
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200', color: 'green.400' }}
                    >
                      IPO Calendar
                    </Button>
                    <Button
                      as="a"
                      href="https://www.angelone.in/calculators/sip-calculator?utm_source=google&utm_medium=cpc&utm_campaign=B2C_Search_Mutual_Fund_SIP_Calculator&network=g&keyword=sip%20calculator&matchtype=e&creative=702410473399&device=c&devicemodel=&gad_source=1&gclid=CjwKCAjwzMi_BhACEiwAX4YZUKVnjxFSBmSfr1Hf1Ucq8dywqeYxGNTPIjm97VCYP4q-P_ADd-qvmhoCsMAQAvD_BwE"
                      target="_blank"
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiBarChart2} color="blue.400" />}
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200', color: 'blue.400' }}
                    >
                      SIP Calculator
                    </Button>
                    <Button
                      as="a"
                      href="https://www.screener.in/company/RELIANCE/consolidated/"
                      target="_blank"
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiFileText} color="purple.400" />}
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200', color: 'purple.400' }}
                    >
                      Stock Screener
                    </Button>
                    <Button
                      as="a"
                      href="https://in.tradingview.com/advanced-charts/"
                      target="_blank"
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiBarChart2} color="blue.400" />}
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200', color: 'blue.400' }}
                    >
                      Advanced Charts
                    </Button>
                  </VStack>
                </Box>
              </Box>
            </AnimatedCard>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default NewsPage;
