import React, { useState } from 'react';
import { Box, Flex, Text, Button, Image, HStack, useDisclosure, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider, AvatarBadge } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiHome, FiMessageCircle, FiCompass, FiBookOpen, FiTrendingUp, FiUsers, FiLogOut, FiUser, FiSettings, FiChevronDown, FiFileText } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

const Navigation: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: 
    <FiHome /> },
    { name: 'AI Chat', path: '/chat', icon: <FiMessageCircle /> },
    { name: 'Discovery', path: '/discovery', icon: <FiCompass /> },
    { name: 'Education', path: '/education', icon: <FiBookOpen /> },
    { name: 'Simulator', path: '/simulator', icon: <FiTrendingUp /> },
    { name: 'News', path: '/news', icon: <FiFileText /> },
    { name: 'Community', path: '/community', icon: <FiUsers /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <Box
      as="nav"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="999"
      transition="all 0.3s ease"
    >
      <Flex
        px={{ base: 4, md: 8 }}
        py={3}
        align="center"
        justify="space-between"
        className={isScrolled ? 'glass-card' : ''}
        borderBottom={isScrolled ? '1px solid rgba(255, 255, 255, 0.7)' : 'none'}
        backdropFilter={isScrolled ? 'blur(10px)' : 'none'}
        transition="all 0.3s ease"
      >
        <RouterLink to="/">
          <Flex align="center">
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Text fontSize="2xl" fontWeight="bold" className="text-gradient">
                AIvestor
              </Text>
            </MotionBox>
          </Flex>
        </RouterLink>

        <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
          {navItems.map((item, index) => (
            <MotionBox
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Button
                as={RouterLink}
                to={item.path}
                variant="ghost"
                leftIcon={item.icon}
                _hover={{ bg: 'rgba(150, 150, 150, 0.3)' }}
                _active={{ bg: 'rgba(114, 188, 212, 0.73)' }}
                color="white"
              >
                {item.name}
              </Button>
            </MotionBox>
          ))}
        </HStack>

        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          {currentUser ? (
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<FiChevronDown />}
                ml={4}
              >
                <Avatar
                  size="sm"
                  src={currentUser.photoURL || undefined}
                  name={currentUser.displayName || 'User'}
                >
                  {userProfile?.isProfileComplete && (
                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                  )}
                </Avatar>
              </MenuButton>
              <MenuList 
                bg="#1A202C" 
                borderColor="rgba(255, 255, 255, 0.1)"
                boxShadow="0px 5px 15px rgba(0, 0, 0, 0.5)"
                borderRadius="md"
                p={2}
              >
                <MenuItem
                  icon={<FiUser />}
                  onClick={() => navigate('/profile')}
                  _hover={{ bg: 'whiteAlpha.100' }}
                  color="white"
                  bg="#1A202C"
                  borderRadius="md"
                >
                  Edit Profile
                </MenuItem>
                <MenuItem
                  icon={<FiSettings />}
                  onClick={() => navigate('/settings')}
                  _hover={{ bg: 'whiteAlpha.100' }}
                  color="white"
                  bg="#1A202C"
                  borderRadius="md"
                >
                  Settings
                </MenuItem>
                <MenuDivider borderColor="whiteAlpha.200" />
                <MenuItem
                  icon={<FiLogOut />}
                  onClick={handleLogout}
                  _hover={{ bg: 'red.800' }}
                  color="white"
                  bg="#1A202C"
                  borderRadius="md"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <Button 
                  variant="outline" 
                  size="md" 
                  className="button-3d"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              </MotionBox>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Button 
                  variant="solid" 
                  size="md" 
                  className="neon-glow button-3d"
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </MotionBox>
            </>
          )}
        </HStack>

        <IconButton
          aria-label="Open Menu"
          size="lg"
          mr={2}
          icon={<FiMenu />}
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="ghost"
        />

        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay backdropFilter="blur(10px)" />
          <DrawerContent bg="#1A202C">
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="stretch" mt={4}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    as={RouterLink}
                    to={item.path}
                    variant="ghost"
                    leftIcon={item.icon}
                    justifyContent="flex-start"
                    onClick={onClose}
                  >
                    {item.name}
                  </Button>
                ))}
                <Box pt={4} borderTopWidth="1px">
                  {currentUser ? (
                    <>
                      <Flex align="center" mb={4}>
                        <Avatar 
                          size="sm" 
                          src={userProfile?.photoURL || currentUser.photoURL || undefined}
                          name={userProfile?.displayName || currentUser.displayName || 'User'}
                          mr={2}
                        />
                        <Text>{userProfile?.displayName || currentUser.displayName || currentUser.email}</Text>
                      </Flex>
                      <Button
                        variant="outline"
                        leftIcon={<FiUser />}
                        onClick={() => {
                          navigate('/profile');
                          onClose();
                        }}
                        mb={2}
                        w="full"
                      >
                        Profile
                      </Button>
                      <Button
                        variant="solid"
                        colorScheme="red"
                        leftIcon={<FiLogOut />}
                        onClick={handleLogout}
                        w="full"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        mb={2}
                        w="full"
                        onClick={() => {
                          navigate('/auth');
                          onClose();
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="solid"
                        colorScheme="blue"
                        w="full"
                        onClick={() => {
                          navigate('/auth');
                          onClose();
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </Box>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
};

export default Navigation;