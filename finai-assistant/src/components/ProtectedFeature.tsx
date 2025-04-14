import React, { ReactNode } from 'react';
import { Box, Button, Text, VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedFeatureProps {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({ 
  children, 
  fallback, 
  featureName = "this feature" 
}) => {
  const { currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const handleAuthRedirect = () => {
    onClose();
    navigate('/auth');
  };

  if (currentUser) {
    return <>{children}</>;
  }

  if (fallback) {
    return (
      <Box onClick={onOpen} cursor="pointer">
        {fallback}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bg="darkBlue.800" color="white">
            <ModalHeader>Authentication Required</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Text>
                  You need to sign in to use {featureName}.
                </Text>
                <Button colorScheme="blue" onClick={handleAuthRedirect}>
                  Sign In
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  return (
    <Box onClick={onOpen} cursor="pointer">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="darkBlue.800" color="white">
          <ModalHeader>Authentication Required</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text>
                You need to sign in to use {featureName}.
              </Text>
              <Button colorScheme="blue" onClick={handleAuthRedirect}>
                Sign In
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      {children}
    </Box>
  );
};

export default ProtectedFeature; 