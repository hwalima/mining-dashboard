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
}) => (
  <motion.div
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

// Mining-themed SVG components
const Pickaxe = ({ color }: { color: string }) => (
  <motion.svg
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
  </motion.svg>
);

const Gem = ({ color }: { color: string }) => (
  <motion.svg
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
  </motion.svg>
);

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#1a1a2e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Background animated shapes */}
          <AnimatedShape color="#ffd700" size={100} initialX={-150} initialY={-150} duration={4} />
          <AnimatedShape color="#4a90e2" size={80} initialX={150} initialY={-100} duration={3.5} />
          <AnimatedShape color="#50c878" size={120} initialX={-100} initialY={150} duration={5} />
          
          {/* Mining-themed elements */}
          <Pickaxe color="#ffd700" />
          <Box sx={{ position: 'absolute', top: '30%', left: '20%' }}>
            <Gem color="#4a90e2" />
          </Box>
          <Box sx={{ position: 'absolute', bottom: '30%', right: '20%' }}>
            <Gem color="#50c878" />
          </Box>

          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            <Box
              component="img"
              src={logoLight}
              alt="Hwalima Digital Logo"
              sx={{
                width: 200,
                height: 'auto',
                marginBottom: 4,
                filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
              }}
            />
          </motion.div>

          <CircularProgress 
            size={40} 
            sx={{ 
              marginBottom: 2,
              color: '#ffd700',
            }} 
          />

          <Typography 
            variant="h5" 
            sx={{ 
              marginBottom: 1,
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255,255,255,0.5)',
            }}
          >
            Welcome to MyMine
          </Typography>

          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              textShadow: '0 0 5px rgba(255,255,255,0.3)',
            }}
          >
            Powered by Hwalima Digital
          </Typography>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
