import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, Button, FormControl, FormLabel, FormErrorMessage, Select, Checkbox, CheckboxGroup, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, HStack, Avatar, AvatarBadge, IconButton, useToast, Progress, Flex, Icon, Divider, RadioGroup, Radio, Stack, Badge, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiEdit, FiUser, FiDollarSign, FiTrendingUp, FiClock, FiTarget, FiShield, FiCheck, FiUpload, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';

const MotionBox = motion(Box);

// Custom theme to improve form elements in dark mode
const formTheme = {
  components: {
    Select: {
      baseStyle: {
        field: {
          bg: "gray.700",
          color: "white",
          borderColor: "gray.600",
          _hover: { borderColor: "blue.400" },
          _focus: { borderColor: "blue.400" }
        }
      }
    },
    Radio: {
      baseStyle: {
        control: {
          borderColor: "gray.500",
          _checked: {
            bg: "blue.500",
            borderColor: "blue.500",
          }
        },
        label: {
          color: "white"
        }
      }
    },
    Checkbox: {
      baseStyle: {
        control: {
          borderColor: "gray.500",
          _checked: {
            bg: "blue.500",
            borderColor: "blue.500",
          }
        },
        label: {
          color: "white"
        }
      }
    },
    Button: {
      variants: {
        ghost: {
          color: "gray.300",
          _hover: { bg: "whiteAlpha.200", color: "white" }
        },
        outline: {
          color: "white",
          borderColor: "gray.600",
          _hover: { bg: "whiteAlpha.200" }
        }
      }
    }
  }
};

const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, updateUserProfile, isLoading } = useAuth();
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  const toast = useToast();
  
  // Form state
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    investmentExperience: '',
    riskTolerance: '',
    investmentGoals: [],
    preferredSectors: [],
    investmentAmount: '',
    investmentTimeframe: '',
    isProfileComplete: false
  });

  // Initialize form with existing profile data if available
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        ...profileData,
        ...userProfile
      });
      
      // If profile is complete, start at summary view
      if (userProfile.isProfileComplete) {
        setFormStep(1);
      }
    }
  }, [userProfile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/auth');
    }
  }, [currentUser, isLoading, navigate]);

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
    
    // Clear error for this field if it exists
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (formStep === 1) {
      if (!profileData.investmentExperience) {
        newErrors.investmentExperience = 'Please select your investment experience';
      }
      if (!profileData.riskTolerance) {
        newErrors.riskTolerance = 'Please select your risk tolerance';
      }
    } else if (formStep === 2) {
      if (!profileData.investmentGoals || profileData.investmentGoals.length === 0) {
        newErrors.investmentGoals = 'Please select at least one investment goal';
      }
      if (!profileData.preferredSectors || profileData.preferredSectors.length === 0) {
        newErrors.preferredSectors = 'Please select at least one sector';
      }
    } else if (formStep === 3) {
      if (!profileData.investmentAmount) {
        newErrors.investmentAmount = 'Please select your investment amount';
      }
      if (!profileData.investmentTimeframe) {
        newErrors.investmentTimeframe = 'Please select your investment timeframe';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setFormStep(formStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setFormStep(formStep - 1);
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    // Validate the form
    if (!validateStep()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mark profile as complete and update
      await updateUserProfile({
        ...profileData,
        isProfileComplete: true
      });
      
      toast({
        title: userProfile?.isProfileComplete 
          ? "Profile updated successfully" 
          : "Profile setup complete!",
        description: userProfile?.isProfileComplete 
          ? "Your investment preferences have been updated." 
          : "You're all set to start your investment journey!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Note: The redirect to homepage happens in the AuthContext if profile is newly completed
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "There was an error saving your profile. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a skip function
  const handleSkip = () => {
    toast({
      title: "Setup skipped",
      description: "You can complete your profile later from your account settings",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
    navigate('/');
  };

  // Investment experience options
  const experienceOptions = [
    { value: 'beginner', label: 'Beginner - New to investing' },
    { value: 'intermediate', label: 'Intermediate - Some experience' },
    { value: 'advanced', label: 'Advanced - Experienced investor' },
    { value: 'expert', label: 'Expert - Professional investor' }
  ];

  // Risk tolerance options
  const riskOptions = [
    { value: 'conservative', label: 'Conservative - Prioritize capital preservation' },
    { value: 'moderate', label: 'Moderate - Balance between growth and safety' },
    { value: 'aggressive', label: 'Aggressive - Focus on growth, accept volatility' },
    { value: 'very-aggressive', label: 'Very Aggressive - Maximum growth potential' }
  ];

  // Investment goals options
  const goalOptions = [
    { value: 'retirement', label: 'Retirement Planning' },
    { value: 'wealth-building', label: 'Long-term Wealth Building' },
    { value: 'education', label: 'Education Funding' },
    { value: 'income', label: 'Regular Income' },
    { value: 'short-term', label: 'Short-term Savings' },
    { value: 'tax-optimization', label: 'Tax Optimization' }
  ];

  // Sector options
  const sectorOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Financial Services' },
    { value: 'consumer', label: 'Consumer Goods' },
    { value: 'energy', label: 'Energy' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'industrials', label: 'Industrials' },
    { value: 'materials', label: 'Materials' },
    { value: 'telecom', label: 'Telecommunications' }
  ];

  // Investment amount options
  const amountOptions = [
    { value: 'less-than-10k', label: 'Less than ₹10,000' },
    { value: '10k-50k', label: '₹10,000 - ₹50,000' },
    { value: '50k-1L', label: '₹50,000 - ₹1,00,000' },
    { value: '1L-5L', label: '₹1,00,000 - ₹5,00,000' },
    { value: '5L-10L', label: '₹5,00,000 - ₹10,00,000' },
    { value: 'more-than-10L', label: 'More than ₹10,00,000' }
  ];

  // Investment timeframe options
  const timeframeOptions = [
    { value: 'short', label: 'Short-term (Less than 1 year)' },
    { value: 'medium', label: 'Medium-term (1-5 years)' },
    { value: 'long', label: 'Long-term (5+ years)' }
  ];

  // Profile gradient
  const profileGradient = "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)";

  if (isLoading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Progress size="xs" isIndeterminate w="200px" />
      </Box>
    );
  }

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
          bgGradient={profileGradient}
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
        
        {/* Decorative profile icon */}
        <MotionBox
          position="absolute"
          top="0"
          right="20px"
          opacity="0.2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Icon as={FiUser} color="white" boxSize="80px" />
        </MotionBox>
      </Box>
      
      <Box as="main" pt="120px" pb="40px">
        <Container maxW="container.md" px={4}>
          {/* Header Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            mb={10}
          >
            <Flex justify="center" mb={6}>
              <Avatar 
                size="xl" 
                src={currentUser?.photoURL || undefined}
                name={currentUser?.displayName || 'User'}
                bg="blue.500"
              >
                {!userProfile?.isProfileComplete && (
                  <AvatarBadge boxSize="1.25em" bg="red.500">
                    <Icon as={FiEdit} fontSize="0.75em" color="white" />
                  </AvatarBadge>
                )}
              </Avatar>
            </Flex>
            
            <Heading as="h1" size="xl" mb={2}>
              {userProfile?.displayName || currentUser?.displayName || 'Welcome!'}
            </Heading>
            
            <Text fontSize="lg" opacity={0.8}>
              {userProfile?.isProfileComplete 
                ? 'Manage your investment profile and preferences' 
                : 'Complete your investment profile to get personalized recommendations'}
            </Text>
            
            {/* Progress indicator */}
            {!userProfile?.isProfileComplete && (
              <Box mt={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Profile Setup</Text>
                  <Text fontSize="sm" fontWeight="bold">Step {formStep} of 3</Text>
                </Flex>
                <Progress 
                  value={(formStep / 3) * 100} 
                  size="sm" 
                  colorScheme="purple" 
                  borderRadius="full"
                />
              </Box>
            )}
          </MotionBox>

          {/* Profile Form */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            bg="darkBlue.800"
            borderRadius="xl"
            p={8}
            boxShadow="xl"
          >
            {/* Step 1: Experience and Risk */}
            {formStep === 1 && (
              <VStack spacing={6} align="stretch">
                <Heading size="md" display="flex" alignItems="center">
                  <Icon as={FiUser} mr={2} />
                  Investment Experience & Risk Profile
                </Heading>
                
                <FormControl isInvalid={!!errors.investmentExperience}>
                  <FormLabel>What is your investment experience?</FormLabel>
                  <Select 
                    placeholder="Select your experience level"
                    value={profileData.investmentExperience}
                    onChange={(e) => handleChange('investmentExperience', e.target.value)}
                    sx={{
                      bg: "gray.700",
                      color: "white",
                      "& option": {
                        background: "#2D3748", // gray.700
                        color: "white"
                      }
                    }}
                  >
                    {experienceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.investmentExperience}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.riskTolerance}>
                  <FormLabel>What is your risk tolerance?</FormLabel>
                  <RadioGroup 
                    value={profileData.riskTolerance}
                    onChange={(value) => handleChange('riskTolerance', value)}
                  >
                    <Stack spacing={4}>
                      {riskOptions.map(option => (
                        <Radio key={option.value} value={option.value} colorScheme="blue" style={{ color: "white" }}>
                          {option.label}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                  <FormErrorMessage>{errors.riskTolerance}</FormErrorMessage>
                </FormControl>
                
                <Flex justify="space-between" mt={8}>
                  {formStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setFormStep(prev => prev - 1)}
                      leftIcon={<FiArrowLeft />}
                      bg="white"
                      color="gray.800"
                      borderColor="gray.300"
                    >
                      Back
                    </Button>
                  )}
                  
                  <HStack spacing={4} ml="auto">
                    {!userProfile?.isProfileComplete && (
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        size="md"
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                      >
                        Skip for now
                      </Button>
                    )}
                    
                    <Button
                      colorScheme="blue"
                      onClick={handleNextStep}
                      rightIcon={<FiArrowRight />}
                      isLoading={isSubmitting}
                      bg="blue.500"
                      color="white"
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            )}
            
            {/* Step 2: Goals and Sectors */}
            {formStep === 2 && (
              <VStack spacing={6} align="stretch">
                <Heading size="md" display="flex" alignItems="center">
                  <Icon as={FiTarget} mr={2} />
                  Investment Goals & Sectors
                </Heading>
                
                <FormControl isInvalid={!!errors.investmentGoals}>
                  <FormLabel>What are your investment goals? (Select all that apply)</FormLabel>
                  <CheckboxGroup
                    value={profileData.investmentGoals}
                    onChange={(value) => handleChange('investmentGoals', value)}
                  >
                    <VStack align="start" spacing={3}>
                      {goalOptions.map(option => (
                        <Checkbox key={option.value} value={option.value} colorScheme="blue" style={{ color: "white" }}>
                          {option.label}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                  <FormErrorMessage>{errors.investmentGoals}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.preferredSectors}>
                  <FormLabel>Which sectors are you interested in? (Select all that apply)</FormLabel>
                  <CheckboxGroup
                    value={profileData.preferredSectors}
                    onChange={(value) => handleChange('preferredSectors', value)}
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      {sectorOptions.map(option => (
                        <Checkbox key={option.value} value={option.value} colorScheme="blue" style={{ color: "white" }}>
                          {option.label}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                  <FormErrorMessage>{errors.preferredSectors}</FormErrorMessage>
                </FormControl>
                
                <Flex justify="space-between" mt={8}>
                  {formStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setFormStep(prev => prev - 1)}
                      leftIcon={<FiArrowLeft />}
                      bg="white"
                      color="gray.800"
                      borderColor="gray.300"
                    >
                      Back
                    </Button>
                  )}
                  
                  <HStack spacing={4} ml="auto">
                    {!userProfile?.isProfileComplete && (
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        size="md"
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                      >
                        Skip for now
                      </Button>
                    )}
                    
                    <Button
                      colorScheme="blue"
                      onClick={handleNextStep}
                      rightIcon={<FiArrowRight />}
                      isLoading={isSubmitting}
                      bg="blue.500"
                      color="white"
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            )}
            
            {/* Step 3: Amount and Timeframe */}
            {formStep === 3 && (
              <VStack spacing={6} align="stretch">
                <Heading size="md" display="flex" alignItems="center">
                  <Icon as={FiDollarSign} mr={2} />
                  Investment Amount & Timeframe
                </Heading>
                
                <FormControl isInvalid={!!errors.investmentAmount}>
                  <FormLabel>How much are you planning to invest?</FormLabel>
                  <Select 
                    placeholder="Select investment amount"
                    value={profileData.investmentAmount}
                    onChange={(e) => handleChange('investmentAmount', e.target.value)}
                    sx={{
                      bg: "gray.700",
                      color: "white",
                      "& option": {
                        background: "#2D3748", // gray.700
                        color: "white"
                      }
                    }}
                  >
                    {amountOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.investmentAmount}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.investmentTimeframe}>
                  <FormLabel>What is your investment timeframe?</FormLabel>
                  <RadioGroup 
                    value={profileData.investmentTimeframe}
                    onChange={(value) => handleChange('investmentTimeframe', value)}
                  >
                    <Stack spacing={4}>
                      {timeframeOptions.map(option => (
                        <Radio key={option.value} value={option.value} colorScheme="blue" style={{ color: "white" }}>
                          {option.label}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                  <FormErrorMessage>{errors.investmentTimeframe}</FormErrorMessage>
                </FormControl>
                
                <Flex justify="space-between" mt={8}>
                  {formStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setFormStep(prev => prev - 1)}
                      leftIcon={<FiArrowLeft />}
                      bg="white"
                      color="gray.800"
                      borderColor="gray.300"
                    >
                      Back
                    </Button>
                  )}
                  
                  <HStack spacing={4} ml="auto">
                    {!userProfile?.isProfileComplete && (
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        size="md"
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                      >
                        Skip for now
                      </Button>
                    )}
                    
                    <Button
                      colorScheme="blue"
                      onClick={handleFormSubmit}
                      rightIcon={<FiCheck />}
                      isLoading={isSubmitting}
                      bg="blue.500"
                      color="white"
                    >
                      {userProfile?.isProfileComplete ? "Update Profile" : "Complete Setup"}
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            )}
            
            {/* Profile Complete View */}
            {userProfile?.isProfileComplete && formStep === 1 && (
              <VStack spacing={6} align="stretch">
                <Heading size="md" display="flex" alignItems="center">
                  <Icon as={FiCheck} mr={2} color="green.400" />
                  Your Investment Profile
                </Heading>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Experience Level</Text>
                  <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                    {experienceOptions.find(o => o.value === userProfile.investmentExperience)?.label || userProfile.investmentExperience}
                  </Badge>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Risk Tolerance</Text>
                  <Badge colorScheme="purple" px={2} py={1} borderRadius="md">
                    {riskOptions.find(o => o.value === userProfile.riskTolerance)?.label || userProfile.riskTolerance}
                  </Badge>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Investment Goals</Text>
                  <Flex flexWrap="wrap" gap={2}>
                    {userProfile.investmentGoals.map(goal => (
                      <Badge key={goal} colorScheme="teal" px={2} py={1} borderRadius="md">
                        {goalOptions.find(o => o.value === goal)?.label || goal}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Preferred Sectors</Text>
                  <Flex flexWrap="wrap" gap={2}>
                    {userProfile.preferredSectors.map(sector => (
                      <Badge key={sector} colorScheme="orange" px={2} py={1} borderRadius="md">
                        {sectorOptions.find(o => o.value === sector)?.label || sector}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Investment Amount</Text>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                    {amountOptions.find(o => o.value === userProfile.investmentAmount)?.label || userProfile.investmentAmount}
                  </Badge>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Investment Timeframe</Text>
                  <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                    {timeframeOptions.find(o => o.value === userProfile.investmentTimeframe)?.label || userProfile.investmentTimeframe}
                  </Badge>
                </Box>
                
                <Divider my={2} />
                
                <Flex justify="flex-end" mt={4}>
                  <Button 
                    leftIcon={<FiEdit />}
                    colorScheme="blue" 
                    onClick={() => setFormStep(2)}
                    variant="outline"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                  >
                    Edit Profile
                  </Button>
                </Flex>
              </VStack>
            )}
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default ProfilePage; 