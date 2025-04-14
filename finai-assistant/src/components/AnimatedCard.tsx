import React, { ReactNode } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface AnimatedCardProps extends BoxProps {
  children: ReactNode;
  delay?: number;
  hoverEffect?: 'zoom' | 'lift' | 'glow' | 'none';
  animation?: 'fade' | 'slide' | 'scale' | 'none';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  hoverEffect = 'lift',
  animation = 'fade',
  ...boxProps
}) => {
  // Animation variants
  const animationVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, delay }
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay }
    },
    none: {
      initial: {},
      animate: {},
      transition: {}
    }
  };

  // Hover effects
  const getHoverEffects = () => {
    switch (hoverEffect) {
      case 'zoom':
        return { scale: 1.05 };
      case 'lift':
        return { y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' };
      case 'glow':
        return { boxShadow: '0 0 15px rgba(14, 165, 233, 0.7), 0 0 30px rgba(14, 165, 233, 0.3)' };
      case 'none':
      default:
        return {};
    }
  };

  const selectedAnimation = animationVariants[animation];

  return (
    <MotionBox
      initial={selectedAnimation.initial}
      animate={selectedAnimation.animate}
      transition={selectedAnimation.transition}
      whileHover={getHoverEffects()}
      className="glass-card card-hover"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      {...boxProps}
    >
      {children}
    </MotionBox>
  );
};

export default AnimatedCard; 