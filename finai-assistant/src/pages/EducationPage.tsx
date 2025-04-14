import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, Flex, Button, Grid, GridItem, VStack, HStack, Icon, Progress, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Tag, Radio, RadioGroup, Stack, Image, SimpleGrid, Spinner, Link, InputGroup, InputLeftElement, Input, Select, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiAward, FiBookOpen, FiCheck, FiCheckCircle, FiClock, FiDollarSign, FiExternalLink, FiLayers, FiPercent, FiPieChart, FiPlay, FiSearch, FiTrendingUp, FiVideo, FiX } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';
import ProtectedFeature from '../components/ProtectedFeature';
import { getPersonalizedRecommendations, getEducationalVideos, Video } from '../services/youtubeServices';

const MotionBox = motion(Box);

const EducationPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<{score: number, total: number} | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [userLevel, setUserLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [sortType, setSortType] = useState<'relevance' | 'date'>('relevance');
  const [lastSearchTerm, setLastSearchTerm] = useState<string>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Mock courses data
  const courses = [
    {
      id: 'investing-101',
      title: 'Investing 101',
      description: 'Learn the basics of investing, including stocks, bonds, and mutual funds.',
      icon: FiTrendingUp,
      color: '#0EA5E9',
      level: 'Beginner',
      duration: '2 hours',
      topics: [
        'Understanding the stock market',
        'Types of investments',
        'Risk vs. reward',
        'Building a portfolio'
      ],
      progress: 35,
      quiz: [
        {
          question: 'What is a stock?',
          options: [
            'A loan given to a company',
            'Partial ownership in a company',
            'A government-backed security',
            'A type of cryptocurrency'
          ],
          correctAnswer: 'Partial ownership in a company'
        },
        {
          question: 'Which type of investment typically has the lowest risk?',
          options: [
            'Stocks',
            'Cryptocurrency',
            'Bonds',
            'Commodities'
          ],
          correctAnswer: 'Bonds'
        },
        {
          question: 'What does diversification mean?',
          options: [
            'Investing all your money in one promising stock',
            'Spreading investments across various assets to reduce risk',
            'Changing your investment strategy frequently',
            'Investing only in foreign markets'
          ],
          correctAnswer: 'Spreading investments across various assets to reduce risk'
        }
      ]
    },
    {
      id: 'personal-finance',
      title: 'Personal Finance Essentials',
      description: 'Master budgeting, saving, and managing debt for financial wellness.',
      icon: FiDollarSign,
      color: '#10B981',
      level: 'Beginner',
      duration: '3 hours',
      topics: [
        'Creating a budget',
        'Emergency funds',
        'Debt management',
        'Saving strategies'
      ],
      progress: 70,
      quiz: [
        {
          question: 'How much should an emergency fund typically cover?',
          options: [
            '1 week of expenses',
            '2-4 weeks of expenses',
            '3-6 months of expenses',
            '2-3 years of expenses'
          ],
          correctAnswer: '3-6 months of expenses'
        }
      ]
    },
    {
      id: 'retirement-planning',
      title: 'Retirement Planning',
      description: 'Plan for your future with strategies for long-term financial security.',
      icon: FiPieChart,
      color: '#8B5CF6',
      level: 'Intermediate',
      duration: '4 hours',
      topics: [
        '401(k) and IRA accounts',
        'Retirement income calculation',
        'Social Security benefits',
        'Withdrawal strategies'
      ],
      progress: 10,
      quiz: []
    },
    {
      id: 'tax-strategies',
      title: 'Tax-Efficient Investing',
      description: 'Learn how to minimize tax impact and maximize returns on investments.',
      icon: FiPercent,
      color: '#F59E0B',
      level: 'Advanced',
      duration: '3 hours',
      topics: [
        'Tax-advantaged accounts',
        'Capital gains strategies',
        'Tax-loss harvesting',
        'Estate planning basics'
      ],
      progress: 0,
      quiz: []
    }
  ];

  // User progress data
  const userProgress = {
    completedCourses: 2,
    totalCourses: courses.length,
    completedQuizzes: 3,
    totalQuizzes: 8,
    earnedPoints: 450,
    nextBadgePoints: 500,
    badges: ['Finance Novice', 'Quiz Master'],
    streakDays: 5
  };

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
    setQuizMode(false);
    setQuizResults(null);
    onOpen();
  };

  const startQuiz = () => {
    setQuizMode(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResults(null);
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedCourse.quiz.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Calculate results
      calculateResults();
    }
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    selectedCourse.quiz.forEach((question: any, index: number) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setQuizResults({
      score: correctAnswers,
      total: selectedCourse.quiz.length
    });
  };

  useEffect(() => {
    const loadRecommendedVideos = async () => {
      console.log('Loading recommended videos for level:', userLevel);
      setIsLoadingVideos(true);
      
      try {
        // First try to get personalized recommendations
        const videos = await getPersonalizedRecommendations(userLevel);
        console.log(`Retrieved ${videos.length} videos successfully`);
        
        if (videos && videos.length > 0) {
          const sortedVideos = sortVideos(videos, sortType);
          setRecommendedVideos(sortedVideos);
          
          if (videos.some(video => video.id.includes('beginner') || video.id.includes('intermediate') || video.id.includes('advanced'))) {
            console.log('Using mock data due to API limitations');
            toast({
              title: "Using offline videos",
              description: "We're currently showing cached videos due to API limitations.",
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          }
        } else {
          console.error('No videos returned from API');
          toast({
            title: "Could not load videos",
            description: "There was an issue loading recommended videos. Please try again later.",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error fetching video recommendations:", error);
        toast({
          title: "Error loading videos",
          description: "An error occurred while loading recommended videos. Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingVideos(false);
      }
    };
    
    loadRecommendedVideos();
  }, [userLevel, toast]);

  // Sort videos based on selected criterion
  const sortVideos = (videos: Video[], sortType: 'relevance' | 'date') => {
    return [...videos].sort((a, b) => {
      if (sortType === 'relevance') {
        return b.levelRelevance - a.levelRelevance;
      } else {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });
  };

  // Handle search functionality with debounce
  const handleSearch = (searchTerm: string) => {
    setLastSearchTerm(searchTerm);
    
    if (!searchTerm) {
      // Reset to default videos for current level
      setIsLoadingVideos(true);
      getPersonalizedRecommendations(userLevel)
        .then(videos => {
          const sortedVideos = sortVideos(videos, sortType);
          setRecommendedVideos(sortedVideos);
          setIsLoadingVideos(false);
        })
        .catch(error => {
          console.error("Error resetting videos:", error);
          setIsLoadingVideos(false);
          toast({
            title: "Error loading videos",
            description: "Could not load default videos. Please try again later.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
      return;
    }
    
    // Set loading state
    setIsLoadingVideos(true);
    console.log(`Searching for videos with term: ${searchTerm}`);
    
    // Search with the user's term
    getPersonalizedRecommendations(userLevel, [searchTerm])
      .then(videos => {
        console.log(`Found ${videos.length} videos for search: ${searchTerm}`);
        const sortedVideos = sortVideos(videos, sortType);
        setRecommendedVideos(sortedVideos);
        
        if (videos.length === 0) {
          toast({
            title: "No results found",
            description: "Try different search terms or select a different skill level.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch(error => {
        console.error("Error searching videos:", error);
        toast({
          title: "Search error",
          description: "There was an issue with your search. Please try different keywords.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsLoadingVideos(false);
      });
  };

  // Handle sorting change
  const handleSortChange = (newSortType: 'relevance' | 'date') => {
    setSortType(newSortType);
    
    // Re-sort current videos without making a new API call
    const sortedVideos = sortVideos(recommendedVideos, newSortType);
    setRecommendedVideos(sortedVideos);
  };

  // Header gradient for education page
  const educationGradient = "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)";

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
          bgGradient={educationGradient}
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
        
        {/* Decorative education icon */}
        <MotionBox
          position="absolute"
          top="0"
          right="20px"
          opacity="0.2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Icon as={FiBookOpen} color="white" boxSize="80px" />
        </MotionBox>
      </Box>
      
      <Box as="main" pt="120px">
        <Container maxW="container.xl" px={4}>
          {/* Header Section with enhanced styling */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            mb={10}
            position="relative"
          >
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
              bg="rgba(139, 92, 246, 0.1)"
              filter="blur(25px)"
              zIndex="-1"
            />
            
            <Heading as="h1" size="xl" mb={4} className="text-gradient" display="inline-flex" alignItems="center">
              <Icon as={FiBookOpen} mr={3} />
              Financial Education Center
            </Heading>
            
            <Text fontSize="lg" opacity={0.8} maxW="800px" mx="auto">
              Expand your financial knowledge with our interactive courses and quizzes.
              Track your progress and earn badges as you master financial concepts.
            </Text>
          </MotionBox>

          {/* User Progress Section */}
          <ProtectedFeature
            featureName="Financial Education"
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
                <Icon as={FiBookOpen} boxSize={12} color="purple.400" mb={4} />
                <Heading size="md" mb={2}>Financial Education Center</Heading>
                <Text mb={4}>Sign in to access our interactive courses and track your learning progress.</Text>
                <Button colorScheme="purple">Sign In to Learn</Button>
              </MotionBox>
            }
          >
            <AnimatedCard p={6} mb={10}>
              <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
                <GridItem>
                  <Heading size="md" mb={4}>Your Learning Progress</Heading>
                  <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                    <VStack align="start" spacing={3}>
                      <Text>Course Completion</Text>
                      <HStack w="100%">
                        <Progress 
                          value={(userProgress.completedCourses / userProgress.totalCourses) * 100} 
                          size="sm" 
                          w="full" 
                          colorScheme="blue" 
                          borderRadius="full"
                        />
                        <Text fontSize="sm" whiteSpace="nowrap">
                          {userProgress.completedCourses}/{userProgress.totalCourses}
                        </Text>
                      </HStack>
                      
                      <Text>Quizzes Passed</Text>
                      <HStack w="100%">
                        <Progress 
                          value={(userProgress.completedQuizzes / userProgress.totalQuizzes) * 100} 
                          size="sm" 
                          w="full" 
                          colorScheme="green" 
                          borderRadius="full"
                        />
                        <Text fontSize="sm" whiteSpace="nowrap">
                          {userProgress.completedQuizzes}/{userProgress.totalQuizzes}
                        </Text>
                      </HStack>
                      
                      <Text>Next Badge Progress</Text>
                      <HStack w="100%">
                        <Progress 
                          value={(userProgress.earnedPoints / userProgress.nextBadgePoints) * 100} 
                          size="sm" 
                          w="full" 
                          colorScheme="purple" 
                          borderRadius="full"
                        />
                        <Text fontSize="sm" whiteSpace="nowrap">
                          {userProgress.earnedPoints}/{userProgress.nextBadgePoints}
                        </Text>
                      </HStack>
                    </VStack>
                    
                    <Flex direction="column" justify="center" align={{ base: "start", sm: "center" }}>
                      <VStack spacing={2}>
                        <HStack spacing={2}>
                          <Icon as={FiAward} color="yellow.400" boxSize={8} />
                          <Text fontSize="3xl" fontWeight="bold" className="text-gradient">
                            {userProgress.earnedPoints}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" opacity={0.8}>Total Learning Points</Text>
                        
                        <HStack mt={4} spacing={2}>
                          <Icon as={FiClock} color="blue.400" />
                          <Text fontWeight="medium">
                            {userProgress.streakDays} day streak!
                          </Text>
                        </HStack>
                      </VStack>
                    </Flex>
                  </Grid>
                </GridItem>
                
                <GridItem bg="whiteAlpha.100" p={4} borderRadius="md">
                  <Text fontWeight="medium" mb={3}>Earned Badges</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {userProgress.badges.map((badge, index) => (
                      <Tag key={index} size="lg" colorScheme={index === 0 ? "blue" : "purple"} p={2}>
                        <HStack spacing={2}>
                          <Icon as={FiAward} />
                          <Text>{badge}</Text>
                        </HStack>
                      </Tag>
                    ))}
                  </Flex>
                </GridItem>
              </Grid>
            </AnimatedCard>
          </ProtectedFeature>

          {/* User Level Selection */}
          <Box mb={8}>
            <Heading size="md" mb={4}>Your Investment Experience Level</Heading>
            <HStack spacing={4}>
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <Button 
                  key={level}
                  colorScheme={userLevel === level ? 'blue' : 'gray'}
                  onClick={() => setUserLevel(level as 'Beginner' | 'Intermediate' | 'Advanced')}
                  leftIcon={<Icon as={FiBookOpen} />}
                >
                  {level}
                </Button>
              ))}
            </HStack>
          </Box>

          {/* Recommended Videos Section with Search */}
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="lg">Recommended Videos for {userLevel} Investors</Heading>
            <HStack spacing={4}>
              <Box w="300px">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search for specific topics..."
                    borderColor="whiteAlpha.300"
                    bg="white"
                    color="gray.800"
                    _hover={{ borderColor: "whiteAlpha.400" }}
                    onChange={(e) => {
                      const searchTerm = e.target.value.trim();
                      
                      // Debounce search
                      const debounceTimer = setTimeout(() => {
                        handleSearch(searchTerm);
                      }, 500);
                      
                      return () => clearTimeout(debounceTimer);
                    }}
                  />
                </InputGroup>
              </Box>
              <Select 
                width="180px" 
                borderColor="whiteAlpha.300"
                bg="white"
                color="gray.800"
                _hover={{ borderColor: "whiteAlpha.400" }}
                defaultValue={sortType}
                onChange={(e) => {
                  handleSortChange(e.target.value as 'relevance' | 'date');
                }}
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="date">Sort by Date</option>
              </Select>
            </HStack>
          </Flex>
          
          {isLoadingVideos ? (
            <Flex justify="center" align="center" h="200px" direction="column">
              <Spinner size="xl" color="blue.400" thickness="4px" mb={4} />
              <Text fontSize="lg">Loading {lastSearchTerm ? `videos for "${lastSearchTerm}"` : `${userLevel} level videos`}...</Text>
            </Flex>
          ) : recommendedVideos && recommendedVideos.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={10}>
              {recommendedVideos.map((video, index) => (
                <Link key={`${video.id}-${index}`} href={video.url} isExternal _hover={{ textDecoration: 'none' }}>
                  <AnimatedCard p={0} overflow="hidden" cursor="pointer" hoverEffect="lift">
                    <Box position="relative">
                      <Image 
                        src={video.thumbnail} 
                        w="full" 
                        h="150px" 
                        objectFit="cover" 
                        borderTopRadius="md"
                        fallbackSrc="https://via.placeholder.com/320x180.png?text=Video+Thumbnail" 
                      />
                      <Flex 
                        position="absolute" 
                        top={2} 
                        right={2} 
                        bg="rgba(0,0,0,0.7)" 
                        color="white" 
                        borderRadius="md" 
                        px={2} 
                        py={1} 
                        alignItems="center"
                        fontSize="xs"
                      >
                        <Icon as={FiPlay} mr={1} />
                        YouTube
                      </Flex>
                    </Box>
                    <Box p={4}>
                      <Heading size="sm" mb={2} noOfLines={2}>{video.title}</Heading>
                      <Text fontSize="sm" color="gray.300" noOfLines={2}>{video.description}</Text>
                      <Flex mt={3} justifyContent="space-between" alignItems="center">
                        <Text fontSize="xs" color="gray.400">
                          {video.channelTitle}
                        </Text>
                        <HStack>
                          <Icon as={FiPlay} color="blue.400" />
                          <Text fontSize="xs" color="blue.400">Watch</Text>
                        </HStack>
                      </Flex>
                    </Box>
                  </AnimatedCard>
                </Link>
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" p={6} bg="gray.800" borderRadius="md" mb={10}>
              <Icon as={FiVideo} boxSize={10} color="gray.500" mb={4} />
              <Heading size="md" mb={2}>No videos found</Heading>
              <Text mb={4}>
                {lastSearchTerm 
                  ? `No results for "${lastSearchTerm}". Try different keywords.` 
                  : "Try changing your experience level or check back later."
                }
              </Text>
              {lastSearchTerm && (
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Icon as={FiBookOpen} />}
                  onClick={() => handleSearch('')}
                >
                  Show All {userLevel} Videos
                </Button>
              )}
            </Box>
          )}

          {/* Courses Section */}
          <Heading size="lg" mb={6}>Learning Modules</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} mb={10}>
            {courses.map((course, index) => (
              <MotionBox
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <AnimatedCard 
                  p={0} 
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => handleCourseSelect(course)}
                  hoverEffect="lift"
                  height="100%"
                >
                  <Box p={5}>
                    <HStack spacing={3} mb={4}>
                      <Flex
                        w="50px"
                        h="50px"
                        bg={`${course.color}20`}
                        color={course.color}
                        borderRadius="lg"
                        justify="center"
                        align="center"
                      >
                        <Icon as={course.icon} boxSize={6} />
                      </Flex>
                      <Box>
                        <Heading size="md">{course.title}</Heading>
                        <HStack mt={1}>
                          <Tag size="sm" colorScheme="blue">{course.level}</Tag>
                          <Flex align="center" fontSize="xs" color="gray.400">
                            <Icon as={FiClock} mr={1} />
                            <Text>{course.duration}</Text>
                          </Flex>
                        </HStack>
                      </Box>
                    </HStack>
                    
                    <Text fontSize="sm" mb={4} noOfLines={2}>
                      {course.description}
                    </Text>
                    
                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="xs" opacity={0.7}>Progress</Text>
                        <Text fontSize="xs" fontWeight="medium">{course.progress}%</Text>
                      </Flex>
                      <Progress 
                        value={course.progress} 
                        size="sm" 
                        colorScheme={course.progress > 0 ? "blue" : "gray"} 
                        borderRadius="full"
                      />
                    </Box>
                  </Box>
                </AnimatedCard>
              </MotionBox>
            ))}
          </Grid>
          
          {/* Course details modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent bg="darkBlue.800" color="white">
              <ModalHeader borderBottomWidth="1px" borderColor="whiteAlpha.200">
                {selectedCourse && (
                  <HStack>
                    <Icon 
                      as={selectedCourse.icon} 
                      color={selectedCourse.color} 
                      boxSize={6} 
                      mr={2}
                    />
                    <Text>{quizMode ? `Quiz: ${selectedCourse.title}` : selectedCourse.title}</Text>
                  </HStack>
                )}
              </ModalHeader>
              <ModalCloseButton />
              
              <ModalBody p={6}>
                {selectedCourse && !quizMode && !quizResults && (
                  <VStack align="stretch" spacing={6}>
                    <Text>{selectedCourse.description}</Text>
                    
                    <Box>
                      <Heading size="sm" mb={3}>Topics Covered</Heading>
                      <VStack align="stretch" spacing={2}>
                        {selectedCourse.topics.map((topic: string, index: number) => (
                          <HStack key={index} spacing={3}>
                            <Icon as={FiCheckCircle} color="green.400" />
                            <Text>{topic}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                    
                    {selectedCourse.quiz.length > 0 && (
                      <Box bg="whiteAlpha.100" p={4} borderRadius="md">
                        <Flex justify="space-between" align="center" mb={2}>
                          <Heading size="sm">Knowledge Check</Heading>
                          <Tag colorScheme="blue">
                            {selectedCourse.quiz.length} Questions
                          </Tag>
                        </Flex>
                        <Text fontSize="sm" mb={4}>
                          Test your understanding of {selectedCourse.title} concepts with this quick quiz.
                        </Text>
                        <Button 
                          leftIcon={<Icon as={FiBookOpen} />} 
                          colorScheme="blue" 
                          onClick={startQuiz}
                        >
                          Start Quiz
                        </Button>
                      </Box>
                    )}
                  </VStack>
                )}
                
                {selectedCourse && quizMode && !quizResults && selectedCourse.quiz.length > 0 && (
                  <VStack align="stretch" spacing={6}>
                    <Flex justify="space-between" align="center">
                      <Tag size="lg" colorScheme="blue">
                        Question {currentQuestionIndex + 1} of {selectedCourse.quiz.length}
                      </Tag>
                      
                      <HStack>
                        {Array.from({ length: selectedCourse.quiz.length }).map((_, i) => (
                          <Box
                            key={i}
                            w="10px"
                            h="10px"
                            borderRadius="full"
                            bg={i === currentQuestionIndex ? "blue.400" : "whiteAlpha.300"}
                          />
                        ))}
                      </HStack>
                    </Flex>
                    
                    <Box bg="whiteAlpha.100" p={6} borderRadius="md">
                      <Heading size="md" mb={6}>
                        {selectedCourse.quiz[currentQuestionIndex].question}
                      </Heading>
                      
                      <RadioGroup 
                        value={selectedAnswers[currentQuestionIndex] || ''}
                        onChange={(value) => handleAnswerSelect(currentQuestionIndex, value)}
                      >
                        <Stack spacing={4}>
                          {selectedCourse.quiz[currentQuestionIndex].options.map((option: string, i: number) => (
                            <Box 
                              key={i} 
                              p={3} 
                              borderWidth="1px" 
                              borderColor={selectedAnswers[currentQuestionIndex] === option ? "blue.400" : "whiteAlpha.200"}
                              borderRadius="md"
                              _hover={{ bg: "whiteAlpha.100" }}
                            >
                              <Radio value={option} colorScheme="blue">
                                {option}
                              </Radio>
                            </Box>
                          ))}
                        </Stack>
                      </RadioGroup>
                    </Box>
                  </VStack>
                )}
                
                {quizResults && (
                  <VStack spacing={6} align="stretch">
                    <Box textAlign="center" py={6}>
                      <Icon 
                        as={quizResults.score === quizResults.total ? FiAward : FiBookOpen} 
                        boxSize={16} 
                        color={quizResults.score === quizResults.total ? "yellow.400" : "blue.400"} 
                        mb={4}
                      />
                      <Heading size="lg" mb={2}>
                        {quizResults.score === quizResults.total ? 'Perfect Score!' : 'Quiz Completed!'}
                      </Heading>
                      <Text fontSize="xl" mb={4}>
                        You scored {quizResults.score} out of {quizResults.total}
                      </Text>
                      <Progress 
                        value={(quizResults.score / quizResults.total) * 100} 
                        size="md" 
                        colorScheme={quizResults.score === quizResults.total ? "green" : "blue"} 
                        borderRadius="full"
                        mb={2}
                      />
                      <Text color="gray.400">
                        {quizResults.score === quizResults.total 
                          ? 'Congratulations! You\'ve mastered this topic!' 
                          : 'Keep learning to improve your score!'}
                      </Text>
                    </Box>
                    
                    <HStack justify="center" spacing={4}>
                      <Button 
                        leftIcon={<Icon as={FiBookOpen} />} 
                        variant="outline"
                        onClick={() => {
                          setQuizMode(false);
                          setQuizResults(null);
                        }}
                      >
                        Back to Course
                      </Button>
                      <Button 
                        leftIcon={<Icon as={FiCheck} />} 
                        colorScheme="blue"
                        onClick={onClose}
                      >
                        Complete
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </ModalBody>
              
              {selectedCourse && quizMode && !quizResults && (
                <ModalFooter borderTopWidth="1px" borderColor="whiteAlpha.200">
                  <Button 
                    colorScheme="blue" 
                    onClick={handleNextQuestion}
                    isDisabled={!selectedAnswers[currentQuestionIndex]}
                    ml="auto"
                  >
                    {currentQuestionIndex < selectedCourse.quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                </ModalFooter>
              )}
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    </Box>
  );
};

export default EducationPage; 