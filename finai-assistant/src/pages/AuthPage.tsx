import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  HStack, 
  Divider, 
  useToast, 
  Icon,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tabs,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
  IconButton,
  InputLeftElement
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Gradient for auth page
  const authGradient = "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)";
  
  // Form validation
  const validateForm = (isSignUp: boolean) => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (isSignUp) {
      if (!name) newErrors.name = 'Name is required';
      
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle sign in with email
  const handleSignIn = async () => {
    if (!validateForm(false)) return;
    
    try {
      setIsSubmitting(true);
      await signInWithEmail(email, password);
      toast({
        title: 'Success',
        description: 'You have been signed in successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sign up with email
  const handleSignUp = async () => {
    if (!validateForm(true)) return;
    
    try {
      setIsSubmitting(true);
      await signUpWithEmail(email, password);
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sign in with Google
  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      toast({
        title: 'Success',
        description: 'You have been signed in with Google successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!email) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }
    
    try {
      await resetPassword(email);
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for instructions to reset your password',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
          bgGradient={authGradient}
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
        
        {/* Decorative icon */}
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
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
            p={8}
            borderRadius="xl"
            boxShadow="xl"
          >
            <Heading as="h1" size="xl" mb={6} textAlign="center">
              Welcome to AIvestor
            </Heading>
            
            <Tabs isFitted variant="enclosed" colorScheme="blue">
              <TabList mb="1em">
                <Tab _selected={{ color: "white", bg: "blue.500" }}>Sign In</Tab>
                <Tab _selected={{ color: "white", bg: "blue.500" }}>Sign Up</Tab>
              </TabList>
              
              <TabPanels>
                {/* Sign In Panel */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Button
                      leftIcon={<FcGoogle />}
                      onClick={handleGoogleSignIn}
                      isLoading={isSubmitting}
                      colorScheme="red"
                      size="lg"
                      w="full"
                    >
                      Sign in with Google
                    </Button>
                    
                    <HStack my={4}>
                      <Divider />
                      <Text fontSize="sm" color="gray.400" whiteSpace="nowrap">or sign in with email</Text>
                      <Divider />
                    </HStack>
                    
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiMail} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiLock} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                    
                    <Button
                      variant="link"
                      alignSelf="flex-end"
                      size="sm"
                      onClick={handleResetPassword}
                      colorScheme="blue"
                    >
                      Forgot Password?
                    </Button>
                    
                    <Button
                      colorScheme="blue"
                      size="lg"
                      onClick={handleSignIn}
                      isLoading={isSubmitting}
                      mt={4}
                    >
                      Sign In
                    </Button>
                  </VStack>
                </TabPanel>
                
                {/* Sign Up Panel */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Button
                      leftIcon={<FcGoogle />}
                      onClick={handleGoogleSignIn}
                      isLoading={isSubmitting}
                      colorScheme="red"
                      size="lg"
                      w="full"
                    >
                      Sign up with Google
                    </Button>
                    
                    <HStack my={4}>
                      <Divider />
                      <Text fontSize="sm" color="gray.400" whiteSpace="nowrap">or sign up with email</Text>
                      <Divider />
                    </HStack>
                    
                    <FormControl isInvalid={!!errors.name}>
                      <FormLabel>Full Name</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiUser} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="text"
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiMail} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiLock} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.confirmPassword}>
                      <FormLabel>Confirm Password</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiLock} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                    </FormControl>
                    
                    <Button
                      colorScheme="blue"
                      size="lg"
                      onClick={handleSignUp}
                      isLoading={isSubmitting}
                      mt={4}
                    >
                      Create Account
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthPage; 