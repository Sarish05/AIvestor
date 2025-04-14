import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Spinner, Button, useToast, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const UpstoxCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for a token
        const response = await fetch(`/api/upstox/callback?code=${code}`);
        const data = await response.json();

        if (data.success) {
          setSuccess(true);
          toast({
            title: 'Authentication Successful',
            description: 'You have been successfully authenticated with Upstox.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          // Store the authentication state in localStorage
          localStorage.setItem('isUpstoxAuthenticated', 'true');
          
          // If this is in a popup, send message to parent window
          if (window.opener) {
            window.opener.postMessage({ type: 'UPSTOX_AUTH_SUCCESS' }, '*');
            // Close the popup after a short delay
            setTimeout(() => window.close(), 1500);
          } else {
            // If not in a popup, redirect to simulator
            setTimeout(() => navigate('/simulator'), 1500);
          }
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        toast({
          title: 'Authentication Failed',
          description: err instanceof Error ? err.message : 'Failed to authenticate with Upstox.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="darkBlue.900"
      color="white"
    >
      <VStack spacing={6} p={8} className="glass-card" borderRadius="xl">
        {loading ? (
          <>
            <Spinner size="xl" color="blue.500" />
            <Text>Completing authentication...</Text>
          </>
        ) : success ? (
          <>
            <Icon as={FiCheckCircle} boxSize={12} color="green.400" />
            <Text fontSize="xl" fontWeight="bold">Authentication Successful!</Text>
            <Text color="gray.400">Redirecting you back to the simulator...</Text>
          </>
        ) : (
          <>
            <Icon as={FiXCircle} boxSize={12} color="red.400" />
            <Text fontSize="xl" fontWeight="bold">Authentication Failed</Text>
            <Text color="red.400">{error}</Text>
            <Button
              colorScheme="blue"
              onClick={() => navigate('/simulator')}
              mt={4}
            >
              Return to Simulator
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default UpstoxCallback; 