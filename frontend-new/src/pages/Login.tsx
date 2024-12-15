import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from '../components/SplashScreen';
import logoLight from '../assets/icon light background.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
      setShowSplash(true);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
      setLoading(false);
    }
  };

  const handleSplashComplete = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}
        >
          <Container 
            maxWidth="xs" 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
              py: 4
            }}
          >
            <Paper
              elevation={3}
              sx={{
                padding: 4,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.5s ease-in-out',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-20px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              <Box
                component="img"
                src={logoLight}
                alt="Hwalima Digital Logo"
                sx={{
                  width: 80,
                  height: 'auto',
                  marginBottom: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                    },
                    '100%': {
                      transform: 'scale(1)',
                    },
                  },
                }}
              />

              <Typography 
                component="h1" 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  textAlign: 'center',
                  color: '#1a1a2e'
                }}
              >
                Welcome to MyMine
              </Typography>

              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{ 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <TextField
                  required
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#115293'
                    },
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 1,
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    Powered by Hwalima Digital
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Link 
                      href="mailto:info@hwalima.digital" 
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: '#1976d2' }
                      }}
                    >
                      info@hwalima.digital
                    </Link>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Link 
                      href="tel:+27785425978" 
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: '#1976d2' }
                      }}
                    >
                      +27 78 542 5978
                    </Link>
                  </Typography>
                  <Typography variant="body2">
                    <Link 
                      href="https://www.hwalima.digital" 
                      target="_blank" 
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: '#1976d2' }
                      }}
                    >
                      www.hwalima.digital
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>
      )}
    </>
  );
}
