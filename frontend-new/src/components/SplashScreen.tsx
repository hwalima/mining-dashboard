import { Box, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoLight from '../assets/icon light background.png';

const AnimatedShape = ({ 
  color, 
  size, 
  initialX, 
  initialY, 
  duration 
}: { 
  color: string; 
  size: number; 
  initialX: number; 
  initialY: number; 
  duration: number; 
}) => {
  const MotionDiv = motion.create('div');
  return (
    <MotionDiv
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent)`,
        filter: 'blur(8px)',
        opacity: 0.6,
      }}
      initial={{ x: initialX, y: initialY, scale: 0 }}
      animate={{
        x: [initialX, initialX + 50, initialX - 50, initialX],
        y: [initialY, initialY - 50, initialY + 50, initialY],
        scale: [1, 1.2, 0.8, 1],
        opacity: [0.6, 0.8, 0.4, 0.6],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Mining-themed SVG components
const Pickaxe = ({ color }: { color: string }) => {
  const MotionSvg = motion.create('svg');
  return (
    <MotionSvg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute' }}
      initial={{ rotate: -45 }}
      animate={{
        rotate: [45, -45],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <path d="M14 4l-4 4L4 2" />
      <path d="M14 4l-4 4 8 8-8 8" />
    </MotionSvg>
  );
};

const Gem = ({ color }: { color: string }) => {
  const MotionSvg = motion.create('svg');
  return (
    <MotionSvg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill={color}
      style={{ position: 'absolute' }}
      initial={{ scale: 0 }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 360],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <path d="M12 2L2 8l10 6 10-6z" />
      <path d="M2 8v8l10 6V14z" />
      <path d="M12 14v8l10-6V8z" />
    </MotionSvg>
  );
};

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [loading, setLoading] = useState(true);
  const MotionBox = motion.create(Box);
  const MotionTypography = motion.create(Typography);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            zIndex: 9999,
          }}
        >
          <Box sx={{ position: 'relative', width: 200, height: 200 }}>
            <AnimatedShape color="#FFD700" size={60} initialX={-30} initialY={-30} duration={3} />
            <AnimatedShape color="#4CAF50" size={40} initialX={40} initialY={20} duration={2.5} />
            <AnimatedShape color="#2196F3" size={50} initialX={-20} initialY={40} duration={3.5} />
            
            <Pickaxe color="#FFD700" />
            <Gem color="#2196F3" />
            
            <Box
              component="img"
              src={logoLight}
              alt="Logo"
              sx={{
                width: 120,
                height: 120,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </Box>
          
          <MotionTypography
            variant="h5"
            sx={{ mt: 2, mb: 3 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Mining Management System
          </MotionTypography>
          
          <CircularProgress size={24} />
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
