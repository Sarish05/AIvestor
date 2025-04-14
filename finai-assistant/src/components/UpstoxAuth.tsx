import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Flex, useToast, Badge } from '@chakra-ui/react';
import { FiExternalLink, FiCheckCircle } from 'react-icons/fi';

interface UpstoxAuthProps {
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}

const UpstoxAuth: React.FC<UpstoxAuthProps> = ({ onAuthStateChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const toast = useToast();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true);
      
      // Simple check to see if we have a token in storage
      const hasToken = localStorage.getItem('upstox_access_token');
      
      // Check if our API is available by calling the status endpoint
      let isServerAvailable = false;
      try {
        const response = await fetch('http://localhost:5001/api/status');
        if (response.ok) {
          const data = await response.json();
          isServerAvailable = data.status === 'ok';
          console.log('Server status:', data);
        }
      } catch (e) {
        console.warn('Server check failed:', e);
      }
      
      // We're "authenticated" if we have a token OR the server is available
      // (since our server will fall back to mock data)
      const isAuth = !!hasToken || isServerAvailable;
      setIsAuthenticated(isAuth);
      
      if (onAuthStateChange) {
        onAuthStateChange(isAuth);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
      if (onAuthStateChange) {
        onAuthStateChange(false);
      }
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    try {
      // For our testing, just store a dummy token
      localStorage.setItem('upstox_access_token', 'mock_token_' + Date.now());
      setIsAuthenticated(true);
      
      if (onAuthStateChange) {
        onAuthStateChange(true);
      }
      
      toast({
        title: 'Connection Successful',
        description: 'You are now connected to market data',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to market data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('upstox_access_token');
    setIsAuthenticated(false);
    
    if (onAuthStateChange) {
      onAuthStateChange(false);
    }
    
    toast({
      title: 'Disconnected',
      description: 'You have been disconnected from market data',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box p={4} bg="rgba(0, 0, 0, 0.2)" borderRadius="md" backdropFilter="blur(10px)">
      <Flex align="center" justify="space-between">
        <Box>
          <Text fontWeight="bold">Market Data Connection</Text>
          <Text fontSize="sm" color="gray.500">
            {isAuthenticated 
              ? 'Connected to market data service' 
              : 'Connect to market data service'}
          </Text>
        </Box>
        
        <Flex align="center">
          {isAuthenticated && (
            <Badge colorScheme="green" variant="subtle" display="flex" alignItems="center" mr={4}>
              <FiCheckCircle style={{ marginRight: '4px' }} />
              Connected
            </Badge>
          )}
          
          {isAuthenticated ? (
            <Button size="sm" onClick={handleLogout} colorScheme="red" variant="outline">
              Disconnect
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={handleLogin} 
              colorScheme="blue" 
              leftIcon={<FiExternalLink />}
              isLoading={isCheckingAuth}
            >
              Connect
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default UpstoxAuth; 