import React, { useEffect, useRef } from 'react';
import { Box, Flex, Text, Button, Container, Grid, GridItem, Heading, VStack, HStack, Icon, SimpleGrid, useBreakpointValue } from '@chakra-ui/react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FiArrowRight, FiBarChart2, FiBookOpen, FiMessageCircle, FiTrendingUp, FiUsers, FiShield, FiHome } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ChatBot from '../components/ChatBot';
import StockChart from '../components/StockChart';
import AnimatedCard from '../components/AnimatedCard';
import ProtectedFeature from '../components/ProtectedFeature';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

const HomePage: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  // Features data
  const features = [
    {
      icon: FiMessageCircle,
      title: 'AI-Powered Chat',
      description: 'Get instant answers to your financial questions with our advanced AI assistant.',
      color: '#0EA5E9',
    },
    {
      icon: FiBarChart2,
      title: 'Market Insights',
      description: 'Stay updated with real-time market data and personalized investment recommendations.',
      color: '#8B5CF6',
    },
    {
      icon: FiBookOpen,
      title: 'Financial Education',
      description: 'Learn financial concepts through interactive modules designed for all knowledge levels.',
      color: '#10B981',
    },
    {
      icon: FiTrendingUp,
      title: 'Investment Simulator',
      description: 'Practice trading with virtual money before investing real funds in the market.',
      color: '#F59E0B',
    },
    {
      icon: FiUsers,
      title: 'Community Insights',
      description: 'Connect with other investors and learn from shared experiences and strategies.',
      color: '#EC4899',
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and protected with enterprise-grade security.',
      color: '#6366F1',
    },
  ];

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Header gradient for home page
  const homeGradient = "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)";

  return (
    <Box minH="100vh">
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
          bgGradient={homeGradient}
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
        
        {/* Decorative home icon */}
        <MotionBox
          position="absolute"
          top="0"
          right="20px"
          opacity="0.2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Icon as={FiHome} color="white" boxSize="80px" />
        </MotionBox>
      </Box>
      
      {/* Hero Section */}
      <Box
        as="section"
        position="relative"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        bg="darkBlue.900"
        pt="40px"
      >
        {/* Animated background with tickers */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.05}
          zIndex={0}
          css={{
            background: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 0h2v20H9V0zm25.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm-20 20l1.732 1-10 17.32-1.732-1 10-17.32zM58.16 4.134l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM80 9v2H60V9h20zM20 69v2H0v-2h20zm79.32-55l-1 1.732-17.32-10L82 4l17.32 10zm-80 80l-1 1.732-17.32-10L2 84l17.32 10zm96.546-75.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-100 100l-1.732 1-10-17.32 1.732-1 10 17.32zM38.16 24.134l1 1.732-17.32 10-1-1.732 17.32-10zM60 29v2H40v-2h20zm19.32 5l-1 1.732-17.32-10L62 24l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM111 40h-2V20h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zM40 49v2H20v-2h20zm19.32 5l-1 1.732-17.32-10L42 44l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM91 60h-2V40h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM39.32 74l-1 1.732-17.32-10L22 64l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM71 80h-2V60h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM120 89v2h-20v-2h20zm-84.134 9.16l-1.732 1-10-17.32 1.732-1 10 17.32zM51 100h-2V80h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM100 109v2H80v-2h20zm19.32 5l-1 1.732-17.32-10 1-1.732 17.32 10zM31 120h-2v-20h2v20z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            animation: 'scroll 60s linear infinite',
          }}
        />

        <Container maxW="container.xl" position="relative" zIndex={2}>
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={10} alignItems="center">
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <MotionHeading
                  as="h1"
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight="extrabold"
                  mb={4}
                  className="text-gradient"
                  lineHeight="1.2"
                >
                  Your AI-powered Financial Guide for Smarter Investing
                </MotionHeading>
                
                <MotionText
                  fontSize={{ base: "lg", md: "xl" }}
                  opacity={0.8}
                  mb={8}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Ask questions, discover investments, and improve financial literacy with AI. Take control of your financial future with personalized guidance.
                </MotionText>
                
                <MotionBox
                  display="flex"
                  flexDirection={{ base: "column", sm: "row" }}
                  gap={4}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Button
                    as={RouterLink}
                    to="/chat"
                    size="lg"
                    colorScheme="blue"
                    rightIcon={<FiArrowRight />}
                    className="neon-glow button-3d"
                    fontSize="md"
                    py={7}
                    px={8}
                  >
                    Start Chat
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/simulator"
                    size="lg"
                    variant="outline"
                    className="button-3d"
                    bg="gray.100"
                    _hover={{ bg: "white" }}
                    fontSize="md"
                    py={7}
                    px={8}
                  >
                    Try Virtual Trading
                  </Button>
                </MotionBox>
              </MotionBox>
            </GridItem>
            
            <GridItem display={{ base: "none", lg: "block" }}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="animate-float"
              >
                <StockChart 
                  symbol="NSE:NIFTY50"
                  companyName="NIFTY 50"
                  period="1M"
                />
              </MotionBox>
            </GridItem>
          </Grid>
        </Container>
        
        {/* Scroll down indicator */}
        <MotionBox
          position="absolute"
          bottom="40px"
          left="50%"
          transform="translateX(-50%)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          <Text fontSize="sm" opacity={0.7} mb={2}>Scroll to Explore</Text>
          <Box width="24px" height="40px" border="2px solid" borderColor="whiteAlpha.500" borderRadius="full" position="relative" display="flex" justifyContent="center">
            <MotionBox
              width="6px"
              height="6px"
              backgroundColor="white"
              borderRadius="full"
              position="absolute"
              top="8px"
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Box>
        </MotionBox>
      </Box>
      
      {/* Features Section */}
      <Box
        as="section"
        py={{ base: 16, md: 24 }}
        bg="darkBlue.800"
        position="relative"
        ref={ref}
      >
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              variants={{
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              textAlign="center"
              maxW="800px"
              mx="auto"
              px={4}
            >
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                fontWeight="bold"
                mb={4}
              >
                Revolutionize Your Financial Journey
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} opacity={0.8}>
                Our platform combines cutting-edge AI technology with financial expertise to provide
                personalized guidance, education, and investment recommendations.
              </Text>
            </MotionBox>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} width="100%">
              {features.map((feature, i) => (
                <MotionBox
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate={controls}
                  variants={cardVariants}
                >
                  <AnimatedCard
                    p={6}
                    height="100%"
                    delay={i * 0.1}
                    animation="none"
                    hoverEffect="glow"
                  >
                    <Flex direction="column" height="100%">
                      <Flex
                        w="60px"
                        h="60px"
                        bg={`${feature.color}20`}
                        color={feature.color}
                        borderRadius="lg"
                        justify="center"
                        align="center"
                        mb={4}
                      >
                        <Icon as={feature.icon} boxSize={6} />
                      </Flex>
                      <Heading size="md" mb={4} fontWeight="bold">
                        {feature.title}
                      </Heading>
                      <Text flex="1" opacity={0.8}>
                        {feature.description}
                      </Text>
                    </Flex>
                  </AnimatedCard>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
      
      {/* Chatbot component */}
      <ProtectedFeature 
        featureName="AI Chat Assistant"
        fallback={
          <MotionBox
            position="fixed"
            bottom="30px"
            right="30px"
            zIndex="900"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card"
            p={3}
            borderRadius="xl"
            textAlign="center"
            maxW="300px"
            boxShadow="0 4px 12px rgba(0,0,0,0.15)"
            _hover={{ transform: "translateY(-5px)", transition: "all 0.3s ease" }}
          >
            <Flex align="center" mb={2}>
              <Icon as={FiMessageCircle} boxSize={6} color="blue.400" mr={2} />
              <Heading size="xs">AIvestor</Heading>
            </Flex>
            <Text fontSize="xs" mb={2} opacity={0.8}>Sign in to chat with our AI assistant.</Text>
            <Button 
              as={RouterLink} 
              to="/auth" 
              size="xs" 
              colorScheme="blue" 
              variant="outline"
              width="full"
            >
              Sign In
            </Button>
          </MotionBox>
        }
      >
        <ChatBot />
      </ProtectedFeature>
    </Box>
  );
};

export default HomePage; 