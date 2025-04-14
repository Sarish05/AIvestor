import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Button, HStack, VStack, Icon, SimpleGrid, Avatar, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Progress, Divider, Menu, MenuButton, MenuList, MenuItem, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Input, Textarea, Select, useToast, Image, FormControl, FormLabel } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FiUsers, FiAward, FiTrendingUp, FiMessageSquare, FiThumbsUp, FiCalendar, FiBriefcase, FiHeart, FiClock, FiChevronDown, FiCheck, FiMoreVertical, FiStar, FiShield, FiTrendingUp as FiTrendingUpIcon, FiDollarSign, FiSearch, FiSend, FiPlus, FiX } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';
import StockChart from '../components/StockChart';
import ProtectedFeature from '../components/ProtectedFeature';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Enhanced motion components with premium animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);

// Premium color constants
const tealGradient = "linear-gradient(135deg, #0BC5EA 0%, #2C7A7B 100%)";
const goldGradient = "linear-gradient(135deg, #F6E05E 0%, #B7791F 100%)";
const greenGradient = "linear-gradient(135deg, #48BB78 0%, #276749 100%)";
const premiumBg = "linear-gradient(135deg, #1A202C 0%, #2D3748 100%)";
const glowEffect = "0px 0px 15px rgba(72, 187, 120, 0.15)";
const cardHoverTransition = { duration: 0.3, ease: "easeOut" };

// Type definitions
interface EventData {
  id: number;
  title: string;
  date: string;
  time: string;
  speaker: string;
  attendees: number;
  category: string;
}

interface CalendarDay {
  day: number | null;
  events: EventData[];
}

interface SuggestedConnection {
  id: number;
  name: string;
  avatar: string;
}

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  returnRate: number;
  streak: number;
  topHoldings: string[];
}

interface CommunityPost {
  id: number;
  user: LeaderboardEntry;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
}

const CommunityPage: React.FC = () => {
  const controls = useAnimation();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Modal controls
  const { isOpen: isPostModalOpen, onOpen: onPostModalOpen, onClose: onPostModalClose } = useDisclosure();
  const { isOpen: isFriendModalOpen, onOpen: onFriendModalOpen, onClose: onFriendModalClose } = useDisclosure();
  
  // Post state
  const [postContent, setPostContent] = useState<string>('');
  const [postTitle, setPostTitle] = useState<string>('');
  const [postCategory, setPostCategory] = useState<string>('general');
  
  // Friend search state
  const [friendSearch, setFriendSearch] = useState<string>('');
  
  // Events calendar data (mock data for now)
  const [eventsData, setEventsData] = useState<EventData[]>([
    {
      id: 1,
      title: 'Webinar: Understanding IPO Investing',
      date: '2025-04-15',
      time: '18:00',
      speaker: 'Rajesh Kumar, Investment Analyst',
      attendees: 156,
      category: 'Educational'
    },
    {
      id: 2,
      title: 'Live Q&A with Top Investors',
      date: '2025-04-22',
      time: '19:30',
      speaker: 'Multiple Guest Speakers',
      attendees: 243,
      category: 'AMA'
    },
    {
      id: 3,
      title: 'Budget Impact Analysis Workshop',
      date: '2025-05-05',
      time: '17:00',
      speaker: 'Neha Gupta, Financial Consultant',
      attendees: 112,
      category: 'Workshop'
    },
    {
      id: 4,
      title: 'Dividend Investing Strategies',
      date: '2025-05-12',
      time: '16:30',
      speaker: 'Arjun Kapoor, Portfolio Manager',
      attendees: 178,
      category: 'Educational'
    },
    {
      id: 5,
      title: 'Technical Analysis Masterclass',
      date: '2025-05-18',
      time: '14:00',
      speaker: 'Vijay Sharma, Trading Expert',
      attendees: 205,
      category: 'Masterclass'
    }
  ]);
  
  // Suggested connections
  const suggestedConnections: SuggestedConnection[] = [
    { id: 1, name: 'Priya Patel', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 2, name: 'Rahul Sharma', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 3, name: 'Aisha Khan', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' }
  ];
  
  // Leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    { 
      id: 1, 
      name: 'Rahul Sharma', 
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg', 
      points: 8750, 
      rank: 1, 
      returnRate: 18.42, 
      streak: 42,
      topHoldings: ['AAPL', 'MSFT', 'AMZN']
    },
    { 
      id: 2, 
      name: 'Priya Patel', 
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg', 
      points: 7620, 
      rank: 2, 
      returnRate: 16.38, 
      streak: 28,
      topHoldings: ['GOOGL', 'TSLA', 'NFLX']
    },
    { 
      id: 3, 
      name: 'Vikram Singh', 
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg', 
      points: 6840, 
      rank: 3, 
      returnRate: 15.12, 
      streak: 19,
      topHoldings: ['NVDA', 'AMZN', 'JPM']
    },
    { 
      id: 4, 
      name: 'Aisha Khan', 
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg', 
      points: 5950, 
      rank: 4, 
      returnRate: 14.75, 
      streak: 14,
      topHoldings: ['META', 'AAPL', 'MSFT']
    },
    { 
      id: 5, 
      name: 'Arjun Mehta', 
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg', 
      points: 4980, 
      rank: 5, 
      returnRate: 13.40, 
      streak: 10,
      topHoldings: ['TSLA', 'GOOGL', 'NFLX']
    }
  ];
  
  // Community posts data
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: 1,
      user: leaderboardData[0], // Rahul Sharma
      title: 'My investment strategy for tech stocks in 2023',
      content: 'I\'ve been focusing on high-growth tech stocks with strong fundamentals. Here\'s my analysis of the current market trends and why I believe companies with solid cash reserves will outperform in the coming quarters...',
      category: 'Strategy',
      timestamp: '2 hours ago',
      likes: 42,
      comments: 15,
      tags: ['Tech Stocks', 'Growth Investing', 'Market Analysis']
    },
    {
      id: 2,
      user: leaderboardData[1], // Priya Patel 
      title: 'How I diversified my portfolio to reduce risk',
      content: 'After seeing high volatility in my all-equity portfolio, I decided to implement a more balanced approach. I\'ve allocated 60% to equities, 20% to bonds, 10% to gold, and 10% to REITs. This has significantly improved my risk-adjusted returns...',
      category: 'Portfolio Management',
      timestamp: '5 hours ago',
      likes: 38,
      comments: 22,
      tags: ['Diversification', 'Risk Management', 'Asset Allocation']
    },
    {
      id: 3,
      user: leaderboardData[2], // Vikram Singh
      title: 'Analyzing the recent banking sector developments',
      content: 'With recent policy changes in the banking sector, I believe we\'re going to see significant shifts in how banks operate. Here\'s my take on which banking stocks might benefit from these changes and why...',
      category: 'Sector Analysis',
      timestamp: '1 day ago',
      likes: 27,
      comments: 19,
      tags: ['Banking Sector', 'Financial Analysis', 'Policy Impact']
    }
  ]);
  
  // Calendar view state
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  // Handle post submission
  const handlePostSubmit = (): void => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your post",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Create a new post with current user information
    const newPost: CommunityPost = {
      id: communityPosts.length + 1,
      user: {
        id: currentUser ? parseInt(currentUser.uid.substring(0, 8), 16) % 1000 : 0, // Convert string uid to a numeric id
        name: userProfile?.displayName || 'You', // Use displayName from UserProfile
        avatar: userProfile?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
        points: 4280,
        rank: 87,
        returnRate: 11.2,
        streak: 7,
        topHoldings: ['AAPL', 'MSFT', 'AMZN']
      },
      title: postTitle,
      content: postContent,
      category: postCategory,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      tags: [postCategory]
    };
    
    // Add the new post to the beginning of the array
    setCommunityPosts([newPost, ...communityPosts]);
    
    toast({
      title: "Post created!",
      description: "Your post has been successfully created",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    
    // Reset form and close modal
    setPostTitle('');
    setPostContent('');
    setPostCategory('general');
    onPostModalClose();
  };
  
  // Handle find friend
  const handleFindFriend = (): void => {
    toast({
      title: "Friend search",
      description: `Searching for users matching "${friendSearch}"`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    setFriendSearch('');
    onFriendModalClose();
  };
  
  // User profile values
  const userPoints = 4280;
  const userReturn = 11.2;
  const userRank = 87;
  const userStreak = 7;
  
  // Generate calendar dates for the selected month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };
  
  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days: CalendarDay[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, events: [] });
    }
    
    // Add days of the month with their events
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = eventsData.filter(event => event.date === dateStr);
      days.push({ day, events: dayEvents });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Premium color theme
  const cardBg = "rgba(26, 32, 44, 0.8)";
  const highlightColor = "#F6AD55"; // Gold/amber
  const accentColor = "#48BB78"; // Green
  const dangerColor = "#E53E3E"; // Red
  const tableBgHover = "rgba(72, 187, 120, 0.08)";

  return (
    <Box minH="100vh" position="relative">
      <Navigation />
      <Box as="main" pt="120px" pb="40px">
        <Container maxW="container.xl" px={4}>
          {/* Header Section with enhanced styling */}
          <Box mb={10} position="relative">
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              position="absolute"
              top="-30px"
              left="-10px"
              width="150px"
              height="150px"
              borderRadius="full"
              bg="rgba(72, 187, 120, 0.1)"
              filter="blur(25px)"
              zIndex="-1"
            />
            
            <MotionText
              as={Heading}
              size="xl"
              mb={4}
              bgGradient={tealGradient}
              bgClip="text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              display="inline-flex"
              alignItems="center"
            >
              <Icon as={FiUsers} mr={3} />
              Community & Leaderboard
            </MotionText>
            
            <MotionText 
              fontSize="lg" 
              opacity={0.9} 
              maxW="800px"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Connect with other investors, share insights, learn from top performers, and participate in investment challenges.
            </MotionText>
          </Box>

          {/* User Status */}
          <ProtectedFeature
            featureName="Community Features"
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
                <Icon as={FiUsers} boxSize={12} color="teal.400" mb={4} />
                <Heading size="md" mb={2}>Join Our Investment Community</Heading>
                <Text mb={4}>Sign in to connect with other investors, share insights, and participate in investment challenges.</Text>
                <Button colorScheme="teal">Sign In to Join</Button>
              </MotionBox>
            }
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card"
              p={6}
              mb={10}
              boxShadow={glowEffect}
              borderColor={accentColor}
              borderWidth="1px"
              _hover={{ 
                boxShadow: "0px 0px 20px rgba(72, 187, 120, 0.25)",
                transition: "all 0.3s ease-in-out"
              }}
            >
              <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
                <Flex align="center" mb={{ base: 6, md: 0 }}>
                  <Box position="relative">
                    <MotionBox
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <Avatar 
                        size="xl" 
                        src={userProfile?.photoURL || "https://bit.ly/broken-link"} 
                        mr={6}
                        name={userProfile?.displayName || "User"}
                      />
                    </MotionBox>
                    <Box
                      position="absolute"
                      top="-5px"
                      right="10px"
                      h="20px"
                      w="20px"
                      borderRadius="full"
                      bgGradient={goldGradient}
                      boxShadow="0px 0px 10px rgba(247, 211, 66, 0.5)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiShield} color="white" boxSize="0.6em" />
                    </Box>
                  </Box>
                  <Box>
                    <MotionHeading 
                      size="md" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome, {userProfile?.displayName?.split(' ')[0] || 'Investor'}!
                    </MotionHeading>
                    <HStack mt={2}>
                      <Text fontSize="sm" color="gray.300">Rank #{userRank}</Text>
                    </HStack>
                    <HStack mt={3}>
                      <Tag size="sm" bgGradient={goldGradient} color="gray.800" borderRadius="full">
                        <Icon as={FiAward} mr={1} />
                        {userPoints} points
                      </Tag>
                      <Tag size="sm" bgGradient={greenGradient} color="white" borderRadius="full">
                        <Icon as={FiTrendingUp} mr={1} />
                        {userReturn}% return
                      </Tag>
                      <Tag size="sm" colorScheme="orange" borderRadius="full">
                        <Icon as={FiClock} mr={1} />
                        {userStreak} day streak
                      </Tag>
                    </HStack>
                  </Box>
                </Flex>
                
                <HStack spacing={4}>
                  <Button 
                    bgGradient={greenGradient} 
                    color="white" 
                    leftIcon={<FiUsers />} 
                    size="sm"
                    onClick={onFriendModalOpen}
                    _hover={{ 
                      bgGradient: "linear-gradient(135deg, #38A169 0%, #276749 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0px 4px 12px rgba(72, 187, 120, 0.3)"
                    }}
                    transition="all 0.3s ease"
                  >
                    Find Friends
                  </Button>
                  <Button 
                    variant="outline" 
                    leftIcon={<FiMessageSquare />} 
                    size="sm"
                    onClick={onPostModalOpen}
                    borderColor={accentColor}
                    color={accentColor}
                    _hover={{
                      bg: "rgba(72, 187, 120, 0.1)",
                      transform: "translateY(-2px)"
                    }}
                    transition="all 0.3s ease"
                  >
                    Create Post
                  </Button>
                </HStack>
              </Flex>
            </MotionBox>
          </ProtectedFeature>

          {/* Main Content Tabs */}
          <Tabs 
            colorScheme="green" 
            variant="soft-rounded" 
            mb={10}
          >
            <TabList 
              mb={6} 
              overflowX="auto" 
              py={2} 
              css={{
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                '-ms-overflow-style': 'none'
              }}
              borderBottom="1px solid"
              borderColor="rgba(72, 187, 120, 0.2)"
            >
              <MotionTab 
                _selected={{ color: 'white', bg: accentColor }}
                _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Leaderboard
              </MotionTab>
              <MotionTab 
                _selected={{ color: 'white', bg: accentColor }}
                _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Community Posts
              </MotionTab>
              <MotionTab 
                _selected={{ color: 'white', bg: accentColor }}
                _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Events
              </MotionTab>
              <MotionTab 
                _selected={{ color: 'white', bg: accentColor }}
                _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Challenges
              </MotionTab>
            </TabList>

            <TabPanels>
              {/* Leaderboard Tab */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                  <GridItem>
                    <MotionBox 
                      className="glass-card" 
                      p={0} 
                      overflow="hidden"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      boxShadow={glowEffect}
                      borderColor="rgba(72, 187, 120, 0.3)"
                      borderWidth="1px"
                    >
                      <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                        <Flex justify="space-between" align="center">
                          <Heading 
                            size="md" 
                            bgGradient={goldGradient} 
                            bgClip="text"
                          >
                            Top Performers
                          </Heading>
                          <HStack>
                            <Menu>
                              <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline" bg="white">
                                This Month
                              </MenuButton>
                              <MenuList bg="white" borderColor="gray.200">
                                <MenuItem>All Time</MenuItem>
                                <MenuItem>This Year</MenuItem>
                                <MenuItem>This Month</MenuItem>
                                <MenuItem>This Week</MenuItem>
                              </MenuList>
                            </Menu>
                            <Menu>
                              <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline" bg="white">
                                Return Rate
                              </MenuButton>
                              <MenuList bg="white" borderColor="gray.200">
                                <MenuItem>Return Rate</MenuItem>
                                <MenuItem>Points</MenuItem>
                                <MenuItem>Streak</MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Flex>
                      </Box>
                      
                      <Table variant="simple">
                        <Thead bg="rgba(72, 187, 120, 0.1)">
                          <Tr>
                            <Th>Rank</Th>
                            <Th>Investor</Th>
                            <Th isNumeric>Return Rate</Th>
                            <Th isNumeric>Points</Th>
                            <Th>Top Holdings</Th>
                            <Th></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {leaderboardData.map((entry, index) => (
                            <MotionTr 
                              key={entry.id} 
                              _hover={{ bg: tableBgHover }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              whileHover={{ 
                                backgroundColor: tableBgHover,
                                transition: { duration: 0.2 }
                              }}
                            >
                              <Td>
                                <Flex align="center" justify="center" w="36px" h="36px" borderRadius="full" bg="whiteAlpha.200">
                                  <Text fontWeight="bold">{entry.rank}</Text>
                                </Flex>
                              </Td>
                              <Td>
                                <Flex align="center">
                                  <Avatar size="sm" src={entry.avatar} mr={3}>
                                  </Avatar>
                                  <Box>
                                    <Text fontWeight="medium">{entry.name}</Text>
                                    <Flex align="center">
                                      <Text fontSize="xs" color="gray.400">{entry.points} points</Text>
                                    </Flex>
                                  </Box>
                                </Flex>
                              </Td>
                              <Td isNumeric color="green.400" fontWeight="medium">
                                +{entry.returnRate}%
                              </Td>
                              <Td isNumeric>
                                <Text fontWeight="medium">{entry.points}</Text>
                              </Td>
                              <Td>
                                <HStack>
                                  {entry.topHoldings.map((holding, index) => (
                                    <Tag size="sm" key={index}>{holding}</Tag>
                                  ))}
                                </HStack>
                              </Td>
                              <Td>
                                <Button size="xs" variant="ghost">View Profile</Button>
                              </Td>
                            </MotionTr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      <Box p={4} textAlign="center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          borderColor={accentColor}
                          color={accentColor}
                          _hover={{
                            bg: "rgba(72, 187, 120, 0.1)",
                            transform: "scale(1.05)"
                          }}
                          transition="all 0.3s ease"
                        >
                          View Full Leaderboard
                        </Button>
                      </Box>
                    </MotionBox>
                  </GridItem>
                  
                  <GridItem>
                    <VStack spacing={6}>
                      <Box className="glass-card" p={6} w="full">
                        <Heading size="md" mb={4}>Your Progress</Heading>
                        <Box mb={6}>
                          <Flex justify="space-between" mb={1}>
                            <Text fontSize="sm">Next Rank</Text>
                            <Text fontSize="sm" fontWeight="medium">Gold Investor (6,000 pts)</Text>
                          </Flex>
                          <Progress value={71} size="sm" colorScheme="blue" borderRadius="full" />
                          <Flex justify="flex-end">
                            <Text fontSize="xs" color="gray.400" mt={1}>
                              1,720 points to go
                            </Text>
                          </Flex>
                        </Box>
                        
                        <VStack spacing={3} align="stretch">
                          <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.100" borderRadius="md">
                            <Flex align="center">
                              <Icon as={FiHeart} color="red.400" mr={2} />
                              <Text fontSize="sm">Daily Login Streak</Text>
                            </Flex>
                            <HStack>
                              <Text fontSize="sm" fontWeight="medium">7 days</Text>
                              <Button size="xs" colorScheme="blue">Check In</Button>
                            </HStack>
                          </Flex>
                          
                          <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.100" borderRadius="md">
                            <Flex align="center">
                              <Icon as={FiBriefcase} color="purple.400" mr={2} />
                              <Text fontSize="sm">Portfolio Value</Text>
                            </Flex>
                            <Text fontSize="sm" fontWeight="medium">₹11,240.35</Text>
                          </Flex>
                          
                          <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.100" borderRadius="md">
                            <Flex align="center">
                              <Icon as={FiMessageSquare} color="green.400" mr={2} />
                              <Text fontSize="sm">Community Engagement</Text>
                            </Flex>
                            <Text fontSize="sm" fontWeight="medium">12 posts</Text>
                          </Flex>
                        </VStack>
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>
              </TabPanel>

              {/* Community Posts Tab */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                  <GridItem>
                    <VStack spacing={6} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Heading size="md">Recent Discussions</Heading>
                        <HStack>
                          <Menu>
                            <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline" bg="white">
                              All Categories
                            </MenuButton>
                            <MenuList bg="white" borderColor="gray.200">
                              <MenuItem>All Categories</MenuItem>
                              <MenuItem>Strategy</MenuItem>
                              <MenuItem>Portfolio Management</MenuItem>
                              <MenuItem>Sector Analysis</MenuItem>
                              <MenuItem>Economy</MenuItem>
                              <MenuItem>Technical Analysis</MenuItem>
                            </MenuList>
                          </Menu>
                          <Button colorScheme="blue" size="sm">New Post</Button>
                        </HStack>
                      </Flex>
                      
                      {/* Community posts */}
                      {communityPosts.map((post) => (
                        <AnimatedCard key={post.id} p={6} delay={post.id * 0.1}>
                          <HStack spacing={4} mb={4}>
                            <Avatar size="md" src={post.user.avatar} mr={3}>
                            </Avatar>
                            <Box>
                              <Text fontWeight="medium">{post.user.name}</Text>
                              <Flex align="center">
                                <Text fontSize="xs" color="gray.400">{post.timestamp}</Text>
                              </Flex>
                            </Box>
                            <Spacer />
                            <Tag size="sm" colorScheme="blue">{post.category}</Tag>
                          </HStack>
                          
                          <Heading size="md" mb={3}>{post.title}</Heading>
                          <Text mb={4} noOfLines={3}>{post.content}</Text>
                          
                          <HStack mb={4} wrap="wrap" spacing={2}>
                            {post.tags.map((tag, index) => (
                              <Tag size="sm" key={index}>{tag}</Tag>
                            ))}
                          </HStack>
                          
                          <Divider mb={4} />
                          
                          <Flex justify="space-between" align="center">
                            <HStack>
                              <Button size="sm" leftIcon={<FiThumbsUp />} variant="ghost">
                                {post.likes}
                              </Button>
                              <Button size="sm" leftIcon={<FiMessageSquare />} variant="ghost">
                                {post.comments}
                              </Button>
                            </HStack>
                            <Button size="sm" variant="ghost">Read More</Button>
                          </Flex>
                        </AnimatedCard>
                      ))}
                      
                      <Button bg="white" variant="outline" size="sm" alignSelf="center">
                        Load More Posts
                      </Button>
                    </VStack>
                  </GridItem>
                  
                  <GridItem>
                    <VStack spacing={6}>
                      <Box className="glass-card" p={6} w="full">
                        <Heading size="md" mb={4}>Upcoming Events</Heading>
                        <VStack spacing={4} align="stretch">
                          {[1, 2, 3].map((event, index) => (
                            <Box 
                              key={event} 
                              p={4} 
                              bg="whiteAlpha.100" 
                              borderRadius="md"
                              borderLeft="4px solid"
                              borderColor="blue.400"
                            >
                              <Flex justify="space-between" mb={2}>
                                <Heading size="sm" noOfLines={1}>Webinar: Understanding IPO Investing</Heading>
                                <Tag size="sm" colorScheme="blue">Educational</Tag>
                              </Flex>
                              <Flex align="center" mb={2}>
                                <Icon as={FiCalendar} mr={2} color="gray.400" />
                                <Text fontSize="sm">April 15, 2025, 6:00 PM IST</Text>
                              </Flex>
                              <Flex align="center" mb={3}>
                                <Icon as={FiUsers} mr={2} color="gray.400" />
                                <Text fontSize="sm">156 attending</Text>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text fontSize="xs" color="gray.400">
                                  Speaker: Rajesh Kumar, Investment Analyst
                                </Text>
                                <Button size="xs" colorScheme="blue">RSVP</Button>
                              </Flex>
                            </Box>
                          ))}
                        </VStack>
                        <Button mt={4} size="sm" variant="ghost" width="full">
                          View All Events
                        </Button>
                      </Box>
                      
                      <Box className="glass-card" p={6} w="full">
                        <Heading size="md" mb={4}>Active Challenges</Heading>
                        <VStack spacing={4} align="stretch">
                          <Box 
                            p={4} 
                            bg="whiteAlpha.100" 
                            borderRadius="md"
                            borderLeft="4px solid"
                            borderColor="purple.400"
                          >
                            <Heading size="sm" mb={2}>Monthly Investment Challenge</Heading>
                            <Flex align="center" mb={3}>
                              <Icon as={FiClock} mr={2} color="gray.400" />
                              <Text fontSize="sm">12 days remaining</Text>
                            </Flex>
                            <Flex justify="space-between" mb={3}>
                              <Text fontSize="sm">Your Position: #28</Text>
                              <Text fontSize="sm" color="green.400">+8.2% return</Text>
                            </Flex>
                            <Progress value={56} size="sm" colorScheme="purple" borderRadius="full" mb={3} />
                            <Button size="sm" variant="outline" width="full">
                              View Challenge
                            </Button>
                          </Box>
                          
                          <Box 
                            p={4} 
                            bg="whiteAlpha.100" 
                            borderRadius="md"
                            borderLeft="4px solid"
                            borderColor="orange.400"
                          >
                            <Heading size="sm" mb={2}>Tech Sector Trading Challenge</Heading>
                            <Flex align="center" mb={3}>
                              <Icon as={FiClock} mr={2} color="gray.400" />
                              <Text fontSize="sm">5 days remaining</Text>
                            </Flex>
                            <Flex justify="space-between" mb={3}>
                              <Text fontSize="sm">Your Position: #42</Text>
                              <Text fontSize="sm" color="green.400">+5.7% return</Text>
                            </Flex>
                            <Progress value={78} size="sm" colorScheme="orange" borderRadius="full" mb={3} />
                            <Button size="sm" variant="outline" width="full">
                              View Challenge
                            </Button>
                          </Box>
                        </VStack>
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>
              </TabPanel>

              {/* Events Tab with Calendar */}
              <TabPanel p={0}>
                <Box className="glass-card" p={6} minH="500px">
                  <Heading size="md" mb={4} display="flex" alignItems="center">
                    <Icon as={FiCalendar} mr={2} color="blue.400" />
                    Upcoming Events Calendar
                  </Heading>
                  
                  {/* Month/Year Selector */}
                  <Flex justify="space-between" align="center" mb={6}>
                    <Flex align="center">
                      <Select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        size="sm"
                        width="130px"
                        mr={2}
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _focus={{ borderColor: "blue.500" }}
                      >
                        {monthNames.map((month, index) => (
                          <option key={index} value={index}>{month}</option>
                        ))}
                      </Select>
                      <Select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        size="sm"
                        width="100px"
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _focus={{ borderColor: "blue.500" }}
                      >
                        {[2024, 2025, 2026].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </Select>
                    </Flex>
                    
                    <Button
                      size="sm"
                      leftIcon={<Icon as={FiPlus} />}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Add Event
                    </Button>
                  </Flex>
                  
                  {/* Calendar Grid */}
                  <Box overflowX="auto">
                    <Grid 
                      templateColumns="repeat(7, 1fr)" 
                      gap={1}
                      fontWeight="medium"
                      textAlign="center"
                      mb={2}
                    >
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <Box key={day} p={2} fontWeight="bold" fontSize="sm" color="gray.400">
                          {day}
                        </Box>
                      ))}
                    </Grid>
                    
                    <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                      {calendarDays.map((dayData, index) => (
                        <Box 
                          key={index} 
                          p={2} 
                          bg={dayData.events.length > 0 ? "rgba(72, 187, 120, 0.1)" : "gray.800"}
                          borderRadius="md"
                          minH="100px"
                          position="relative"
                          border="1px solid"
                          borderColor={dayData.events.length > 0 ? "green.400" : "transparent"}
                          opacity={dayData.day ? 1 : 0.3}
                        >
                          {dayData.day && (
                            <>
                              <Text fontSize="sm" fontWeight="bold">
                                {dayData.day}
                              </Text>
                              <VStack spacing={1} mt={1} align="stretch">
                                {dayData.events.map(event => (
                                  <Box 
                                    key={event.id}
                                    p={1}
                                    bg="rgba(72, 187, 120, 0.2)"
                                    borderRadius="sm"
                                    fontSize="xs"
                                    cursor="pointer"
                                    _hover={{ bg: "rgba(72, 187, 120, 0.3)" }}
                                    title={event.title}
                                    onClick={() => toast({
                                      title: event.title,
                                      description: `${event.date} at ${event.time} • Speaker: ${event.speaker}`,
                                      status: "info",
                                      duration: 5000,
                                      isClosable: true,
                                    })}
                                  >
                                    <Text noOfLines={1}>{event.title}</Text>
                                    <Text color="green.300">{event.time}</Text>
                                  </Box>
                                ))}
                              </VStack>
                            </>
                          )}
                        </Box>
                      ))}
                    </Grid>
                  </Box>
                  
                  {/* Upcoming Events List */}
                  <Box mt={8}>
                    <Heading size="sm" mb={4}>Upcoming Events</Heading>
                    <VStack spacing={4} align="stretch">
                      {eventsData
                        .filter(event => new Date(`${event.date}T${event.time}`).getTime() > new Date().getTime())
                        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                        .slice(0, 3)
                        .map(event => (
                          <Box 
                            key={event.id}
                            p={4} 
                            bg="whiteAlpha.100" 
                            borderRadius="md"
                            borderLeft="4px solid"
                            borderColor="green.400"
                          >
                            <Heading size="sm" mb={2}>{event.title}</Heading>
                            <Flex align="center" mb={2}>
                              <Icon as={FiCalendar} mr={2} color="gray.400" />
                              <Text fontSize="sm">
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })} at {event.time}
                              </Text>
                            </Flex>
                            <Flex align="center" mb={3}>
                              <Icon as={FiUsers} mr={2} color="gray.400" />
                              <Text fontSize="sm">{event.attendees} attending</Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="xs" color="gray.400">
                                Speaker: {event.speaker}
                              </Text>
                              <Button size="xs" colorScheme="green">RSVP</Button>
                            </Flex>
                          </Box>
                        ))
                      }
                    </VStack>
                  </Box>
                </Box>
              </TabPanel>

              {/* Challenges Tab - Basic placeholder */}
              <TabPanel p={0}>
                <Box className="glass-card" p={6}>
                  <Heading size="md" mb={4}>Investment Challenges</Heading>
                  <Text>Complete challenges system will be implemented here.</Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
      
      {/* Create Post Modal */}
      <Modal isOpen={isPostModalOpen} onClose={onPostModalClose} size="lg">
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent bg="gray.800" borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottomWidth="1px" borderColor="gray.700">Create a Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Title</FormLabel>
                <Input 
                  placeholder="Post title" 
                  value={postTitle} 
                  onChange={e => setPostTitle(e.target.value)}
                  bg="white"
                  color="gray.800"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500" }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Category</FormLabel>
                <Select 
                  value={postCategory} 
                  onChange={e => setPostCategory(e.target.value)}
                  bg="white"
                  color="gray.800"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500" }}
                >
                  <option value="general">General Discussion</option>
                  <option value="stocks">Stocks</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="analysis">Technical Analysis</option>
                  <option value="news">Market News</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Content</FormLabel>
                <Textarea 
                  placeholder="Share your thoughts or questions..." 
                  rows={6}
                  value={postContent} 
                  onChange={e => setPostContent(e.target.value)}
                  bg="white"
                  color="gray.800"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPostModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handlePostSubmit} leftIcon={<FiSend />}>
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Find Friends Modal */}
      <Modal isOpen={isFriendModalOpen} onClose={onFriendModalClose} size="md">
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent bg="gray.800" borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottomWidth="1px" borderColor="gray.700">Find Friends</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <Box position="relative">
                <Input 
                  placeholder="Search by name or email" 
                  value={friendSearch} 
                  onChange={e => setFriendSearch(e.target.value)}
                  pr="40px"
                  bg="white"
                  color="gray.800"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500" }}
                />
                <Icon 
                  as={FiSearch} 
                  position="absolute"
                  right="12px"
                  top="50%"
                  transform="translateY(-50%)"
                  color="gray.500"
                />
              </Box>
              
              <VStack mt={4} align="stretch" spacing={3}>
                <Text fontSize="sm" color="gray.400">Suggested Connections</Text>
                
                {/* Mock suggested connections */}
                {suggestedConnections.map((person) => (
                  <Flex 
                    key={person.id} 
                    align="center" 
                    justify="space-between"
                    p={2}
                    borderRadius="md"
                    _hover={{ bg: 'gray.700' }}
                  >
                    <Flex align="center">
                      <Avatar size="sm" src={person.avatar} name={person.name} mr={3} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">{person.name}</Text>
                      </Box>
                    </Flex>
                    <Button size="xs" leftIcon={<FiPlus />} colorScheme="green" variant="ghost">
                      Connect
                    </Button>
                  </Flex>
                ))}
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFriendModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleFindFriend} leftIcon={<FiSearch />}>
              Search
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Define MotionHeading and MotionTab components
const MotionHeading = motion(Heading);
const MotionTab = motion(Tab);
const MotionTr = motion(Tr);

// Missing component from the Chakra UI import
const Spacer = () => <Box flex="1" />;

export default CommunityPage;