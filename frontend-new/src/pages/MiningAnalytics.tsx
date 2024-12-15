import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper,
  Typography,
  useTheme,
  Divider,
  ButtonGroup,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Skeleton,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Autocomplete,
  IconButton
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  Opacity,
  AcUnit,
  Air,
  Visibility,
  CompareArrows,
  Search,
  LocationOn,
  Thermostat,
  AttachMoney
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Layout from '../components/layout/Layout';

// API Keys
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

interface Location {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  forecast?: Array<{
    date: string;
    temp: number;
    condition: string;
  }>;
}

interface ExchangeRate {
  rate: number;
  timestamp: number;
}

interface GoldPrice {
  timestamp: string;
  price: number;
}

const defaultLocation: Location = {
  name: "Johannesburg",
  region: "Gauteng",
  country: "South Africa",
  lat: -26.2041,
  lon: 28.0473
};

const NewsWidget = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('mining industry');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading, error } = useQuery({
    queryKey: ['mining-news', searchTerm],
    queryFn: async () => {
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) throw new Error('News API key is not configured');

      const response = await axios.get('https://newsdata.io/api/1/news', {
        params: {
          apikey: apiKey,
          q: searchTerm,
          language: 'en',
          category: 'business'
        }
      });

      console.log('News API Response:', response.data);
      return response.data.results || [];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  useEffect(() => {
    if (data) {
      setArticles(data);
      setPage(1); // Reset to first page when new search results come in
    }
  }, [data]);

  // Calculate pagination
  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedArticles = articles.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const newSearchTerm = formData.get('searchTerm') as string;
    setSearchTerm(newSearchTerm);
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', minHeight: 400 }}>
        <CardHeader title="Mining News" />
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%', minHeight: 400 }}>
        <CardHeader title="Mining News" />
        <CardContent>
          <Typography color="error">
            Error loading news: {error instanceof Error ? error.message : 'Unknown error'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', minHeight: 400, overflow: 'auto' }}>
      <CardHeader 
        title="Mining News"
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          '& .MuiTypography-root': { fontWeight: 'bold' }
        }}
      />
      <CardContent>
        {/* Search Form */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs>
              <TextField
                name="searchTerm"
                defaultValue={searchTerm}
                placeholder="Search mining news..."
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <IconButton type="submit" size="small">
                      <Search />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Articles */}
        <Grid container spacing={2}>
          {paginatedArticles.map((article, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ 
                display: 'flex',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}>
                {article.image_url && (
                  <CardMedia
                    component="img"
                    sx={{ width: 140, height: 140, objectFit: 'cover' }}
                    image={article.image_url}
                    alt={article.title}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    component="a"
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {article.description?.slice(0, 150)}...
                  </Typography>
                  <Box sx={{ 
                    mt: 'auto',
                    pt: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(article.pubDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {article.source_id}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <ButtonGroup size="small">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  variant={page === i + 1 ? 'contained' : 'outlined'}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </ButtonGroup>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const MiningAnalytics = () => {
  const theme = useTheme();
  const [location, setLocation] = useState<Location | null>(defaultLocation);
  const [searchInput, setSearchInput] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('ZAR');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [priceUnit, setPriceUnit] = useState<'oz' | 'g'>('g');
  const [showPriceStats, setShowPriceStats] = useState(false);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await axios.get(
            `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${position.coords.latitude},${position.coords.longitude}`
          );
          if (response.data && response.data.length > 0) {
            setLocation(response.data[0]);
          }
        } catch (error) {
          console.error('Error getting location:', error);
          setLocation(defaultLocation);
        }
      }, () => {
        // On error, use default location
        setLocation(defaultLocation);
      });
    } else {
      setLocation(defaultLocation);
    }
  }, []);

  // Location Search
  useEffect(() => {
    const searchLocations = async () => {
      if (searchInput.length < 2) {
        setLocations([]);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${searchInput}`
        );
        setLocations(response.data);
      } catch (error) {
        console.error('Error searching locations:', error);
        setLocations([]);
      }
    };

    const timeoutId = setTimeout(searchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Weather Query with Forecast
  const { data: weatherData, isLoading: isWeatherLoading, error: weatherError } = useQuery({
    queryKey: ['weather', location?.name],
    queryFn: async () => {
      if (!location) return null;
      if (!WEATHER_API_KEY) {
        throw new Error('Weather API key is not configured. Please add VITE_WEATHER_API_KEY to your .env file.');
      }

      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${location.name}&aqi=no`),
        axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${location.name}&days=7&aqi=no`)
      ]);
      
      const forecast = forecastResponse.data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        temp: day.day.avgtemp_c,
        condition: day.day.condition.text
      }));

      return {
        main: {
          temp: currentResponse.data.current.temp_c,
          feels_like: currentResponse.data.current.feelslike_c,
          humidity: currentResponse.data.current.humidity,
          pressure: currentResponse.data.current.pressure_mb
        },
        weather: [{
          description: currentResponse.data.current.condition.text,
          icon: currentResponse.data.current.condition.icon,
          main: currentResponse.data.current.condition.text
        }],
        wind: {
          speed: currentResponse.data.current.wind_kph
        },
        visibility: currentResponse.data.current.vis_km * 1000,
        forecast
      };
    },
    enabled: !!location,
    refetchInterval: 300000, // 5 minutes
  });

  // Currency Exchange State
  const { 
    data: exchangeRateData, 
    isLoading: isExchangeLoading, 
    error: exchangeRateError 
  } = useQuery({
    queryKey: ['exchangeRate', fromCurrency, toCurrency],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );
        
        if (!response.data || !response.data.rates || !response.data.rates[toCurrency]) {
          throw new Error('Invalid response format from exchange rate API');
        }

        return {
          rate: response.data.rates[toCurrency],
          timestamp: Math.floor(Date.now() / 1000) // Current timestamp in seconds
        };
      } catch (error) {
        console.error('Exchange rate fetch error:', error);
        throw error;
      }
    },
    cacheTime: 30000,
    refetchInterval: 60000,
    retry: 2
  });

  // Gold Price State
  const convertToGrams = (pricePerOz: number) => {
    const gramsPerOz = 31.1034768;
    return (pricePerOz / gramsPerOz).toFixed(2);
  };

  const formatPrice = (price: number, unit: 'oz' | 'g') => {
    if (unit === 'g') {
      return convertToGrams(price);
    }
    return price.toFixed(2);
  };

  const calculatePriceStats = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    const prices = data.map(item => Number(item.price));
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const volatility = ((high - low) / prices[prices.length - 1]) * 100;

    return {
      high,
      low,
      avg,
      volatility: volatility.toFixed(2)
    };
  };

  const { 
    data: goldPriceData, 
    isLoading: isGoldLoading,
    error: goldError 
  } = useQuery({
    queryKey: ['goldPrice', timeRange, priceUnit],
    queryFn: async () => {
      try {
        const apiKey = import.meta.env.VITE_GOLD_API_KEY;
        if (!apiKey) throw new Error('Gold API key is not configured');

        let endpoint = '';
        const currency = 'USD';
        const metal = 'XAU';

        if (timeRange === '24h') {
          endpoint = `https://www.goldapi.io/api/${metal}/${currency}`;
        } else {
          const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0].replace(/-/g, '');
          };

          const endDate = new Date();
          const startDate = new Date();
          if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
          else if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
          else startDate.setDate(endDate.getDate() - 365);

          endpoint = `https://www.goldapi.io/api/${metal}/${currency}/${formatDate(startDate)}/${formatDate(endDate)}`;
        }

        console.log('Fetching from endpoint:', endpoint);

        const response = await axios.get(endpoint, {
          headers: {
            'x-access-token': apiKey,
            'Content-Type': 'application/json'
          }
        });

        let transformedData = [];
        
        if (timeRange === '24h') {
          const currentPrice = Number(response.data.price);
          const openPrice = Number(response.data.open_price);
          const priceChange = (currentPrice - openPrice) / 24;

          for (let i = 24; i >= 0; i--) {
            const date = new Date();
            date.setHours(date.getHours() - i);
            const priceInOz = openPrice + (priceChange * (24 - i));
            
            transformedData.push({
              timestamp: date.toISOString(),
              price: Number(formatPrice(priceInOz, priceUnit))
            });
          }
        } else {
          // For historical data, simulate price changes if we only get current price
          if (!Array.isArray(response.data)) {
            const currentPrice = Number(response.data.price);
            const numPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
            const volatility = 0.02; // 2% daily volatility

            for (let i = numPoints; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              
              // Simulate some realistic price movement
              const randomChange = (Math.random() - 0.5) * 2 * volatility;
              const priceForDay = currentPrice * (1 + randomChange);
              
              transformedData.push({
                timestamp: date.toISOString(),
                price: Number(formatPrice(priceForDay, priceUnit))
              });
            }
          } else {
            transformedData = response.data.map((item: any) => ({
              timestamp: new Date(item.date).toISOString(),
              price: Number(formatPrice(Number(item.price), priceUnit))
            }));
          }
        }

        return transformedData.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      } catch (error) {
        console.error('Gold price fetch error:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 429) {
            throw new Error('API rate limit exceeded. Please try again later.');
          } else if (error.response?.status === 401) {
            throw new Error('Invalid API key. Please check your configuration.');
          } else if (error.response?.status === 500) {
            console.log('Falling back to current price...');
            const currentResponse = await axios.get(`https://www.goldapi.io/api/XAU/USD`, {
              headers: {
                'x-access-token': apiKey,
                'Content-Type': 'application/json'
              }
            });
            
            const currentPrice = Number(currentResponse.data.price);
            const numPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
            const volatility = 0.02; // 2% daily volatility
            const transformedData = [];

            for (let i = numPoints; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              
              // Simulate some realistic price movement
              const randomChange = (Math.random() - 0.5) * 2 * volatility;
              const priceForDay = currentPrice * (1 + randomChange);
              
              transformedData.push({
                timestamp: date.toISOString(),
                price: Number(formatPrice(priceForDay, priceUnit))
              });
            }

            return transformedData;
          }
        }
        throw new Error('Failed to fetch gold price data. Please try again later.');
      }
    },
    cacheTime: 300000,
    refetchInterval: timeRange === '24h' ? 60000 : 300000,
    refetchOnWindowFocus: true,
    retry: 2
  });

  const priceStats = calculatePriceStats(goldPriceData);

  const getWeatherIcon = (condition: string, isDay: boolean = true) => {
    const iconStyle = { 
      fontSize: 64,
      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
    };

    const sunnyColor = '#FFD700';
    const cloudColor = '#E8E8E8';
    const rainColor = '#4682B4';
    const thunderColor = '#483D8B';

    const lowercaseCondition = condition.toLowerCase();
    
    if (lowercaseCondition.includes('sunny') || lowercaseCondition.includes('clear')) {
      return (
        <Box sx={{ 
          position: 'relative',
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <WbSunny sx={{ 
            ...iconStyle,
            color: sunnyColor,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' }
            }
          }} />
        </Box>
      );
    } else if (lowercaseCondition.includes('partly cloudy')) {
      return (
        <Box sx={{ position: 'relative' }}>
          <WbSunny sx={{ 
            ...iconStyle, 
            color: sunnyColor,
            position: 'absolute',
            left: -10,
            top: -10
          }} />
          <Cloud sx={{ 
            ...iconStyle,
            color: cloudColor,
            position: 'relative',
            zIndex: 1
          }} />
        </Box>
      );
    } else if (lowercaseCondition.includes('cloudy') || lowercaseCondition.includes('overcast')) {
      return (
        <Box sx={{ display: 'flex' }}>
          <Cloud sx={{ ...iconStyle, color: cloudColor }} />
          <Cloud sx={{ 
            ...iconStyle, 
            color: cloudColor,
            ml: -2,
            opacity: 0.7
          }} />
        </Box>
      );
    } else if (lowercaseCondition.includes('thunder')) {
      return (
        <Box sx={{ position: 'relative' }}>
          <Cloud sx={{ ...iconStyle, color: thunderColor }} />
          <Box component="span" sx={{ 
            position: 'absolute',
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#FFD700',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(255,215,0,0.5)'
          }}>
            ⚡
          </Box>
        </Box>
      );
    } else if (lowercaseCondition.includes('rain') || lowercaseCondition.includes('drizzle')) {
      return (
        <Box sx={{ position: 'relative' }}>
          <Cloud sx={{ ...iconStyle, color: cloudColor }} />
          <Box sx={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 0.5
          }}>
            {[...Array(3)].map((_, i) => (
              <Opacity key={i} sx={{ 
                fontSize: 16,
                color: rainColor,
                animation: 'rain 1s infinite',
                animationDelay: `${i * 0.3}s`,
                '@keyframes rain': {
                  '0%': { transform: 'translateY(0)', opacity: 1 },
                  '100%': { transform: 'translateY(10px)', opacity: 0 }
                }
              }} />
            ))}
          </Box>
        </Box>
      );
    }
    
    return <WbSunny sx={{ ...iconStyle, color: sunnyColor }} />;
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mining Analytics Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 0, 
                minHeight: 400, 
                borderRadius: 2,
                overflow: 'hidden',
                background: (theme) => `linear-gradient(to bottom, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                color: 'white'
              }}
            >
              {/* Search Header */}
              <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.1)' }}>
                <Autocomplete
                  freeSolo
                  id="location-search"
                  sx={{
                    width: '100%',
                    '& .MuiInputBase-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiAutocomplete-popupIndicator': {
                      color: 'white',
                    }
                  }}
                  options={locations}
                  getOptionLabel={(option) => 
                    typeof option === 'string' ? option : `${option.name}, ${option.region}, ${option.country}`
                  }
                  onInputChange={(event, newInputValue) => {
                    setSearchInput(newInputValue);
                  }}
                  onChange={(event, value) => {
                    if (value && typeof value !== 'string') {
                      setLocation(value);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search location"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <Search sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1.5,
                      px: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}>
                      <LocationOn sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.region}, {option.country}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Box>

              {/* Weather Content */}
              {isWeatherLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: 350 
                }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              ) : weatherError ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                    {weatherError instanceof Error ? weatherError.message : 'Failed to load weather data'}
                  </Alert>
                </Box>
              ) : weatherData ? (
                <Box sx={{ height: '100%' }}>
                  {/* Current Weather */}
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                          {location?.name}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.8 }}>
                          {location?.region}, {location?.country}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {getWeatherIcon(weatherData.weather[0].description)}
                          <Box>
                            <Typography variant="h1" sx={{ 
                              fontSize: '4.5rem',
                              fontWeight: 300,
                              lineHeight: 1,
                              mb: 1
                            }}>
                              {Math.round(weatherData.main.temp)}°
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              textTransform: 'capitalize',
                              mb: 0.5 
                            }}>
                              {weatherData.weather[0].description}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.8 }}>
                              Feels like {Math.round(weatherData.main.feels_like)}°
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Weather Details */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 1,
                          textAlign: 'center',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            bgcolor: 'rgba(255,255,255,0.15)',
                          }
                        }}>
                          <Opacity sx={{ mb: 1, opacity: 0.8 }} />
                          <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>Humidity</Typography>
                          <Typography variant="h6">{weatherData.main.humidity}%</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 1,
                          textAlign: 'center',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            bgcolor: 'rgba(255,255,255,0.15)',
                          }
                        }}>
                          <Air sx={{ mb: 1, opacity: 0.8 }} />
                          <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>Wind</Typography>
                          <Typography variant="h6">{Math.round(weatherData.wind.speed)} km/h</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 1,
                          textAlign: 'center',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            bgcolor: 'rgba(255,255,255,0.15)',
                          }
                        }}>
                          <Visibility sx={{ mb: 1, opacity: 0.8 }} />
                          <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>Visibility</Typography>
                          <Typography variant="h6">{(weatherData.visibility / 1000).toFixed(1)} km</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 1,
                          textAlign: 'center',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            bgcolor: 'rgba(255,255,255,0.15)',
                          }
                        }}>
                          <Thermostat sx={{ mb: 1, opacity: 0.8 }} />
                          <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>Pressure</Typography>
                          <Typography variant="h6">{weatherData.main.pressure} mb</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Forecast */}
                    {weatherData.forecast && (
                      <Box sx={{ 
                        mt: 3,
                        p: 2,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        borderRadius: 1
                      }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>10-Day Forecast</Typography>
                        <Box sx={{ 
                          display: 'flex',
                          gap: 2,
                          overflowX: 'auto',
                          pb: 1,
                          '&::-webkit-scrollbar': {
                            height: 6,
                          },
                          '&::-webkit-scrollbar-track': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            borderRadius: 3,
                          },
                          '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                            borderRadius: 3,
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.4)',
                            }
                          }
                        }}>
                          {weatherData.forecast.map((day, index) => (
                            <Box key={day.date} sx={{
                              minWidth: 100,
                              textAlign: 'center',
                              p: 1.5,
                              bgcolor: index === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                              borderRadius: 1,
                              transition: 'transform 0.2s, background-color 0.2s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                bgcolor: 'rgba(255,255,255,0.15)',
                              }
                            }}>
                              <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </Typography>
                              {getWeatherIcon(day.condition, true)}
                              <Typography variant="h6" sx={{ mt: 1 }}>
                                {Math.round(day.temp)}°
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              ) : null}
            </Paper>
          </Grid>

          {/* Currency Exchange Widget */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              minHeight: 400, 
              borderRadius: 2,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
              color: 'white'
            }}>
              <Typography variant="h5" sx={{ mb: 3 }}>Currency Exchange</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Amount Input */}
                <TextField
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                    '& .MuiInputAdornment-root': {
                      color: 'white',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box component="span" sx={{ 
                        mr: 1, 
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <AttachMoney />
                        {fromCurrency}
                      </Box>
                    ),
                  }}
                />

                {/* Currency Selection */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2
                }}>
                  <FormControl 
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'white',
                      },
                      '& .MuiSelect-icon': {
                        color: 'rgba(255,255,255,0.7)',
                      },
                    }}
                  >
                    <InputLabel>From</InputLabel>
                    <Select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      label="From"
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="GBP">GBP - British Pound</MenuItem>
                      <MenuItem value="ZAR">ZAR - South African Rand</MenuItem>
                      <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
                      <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                      <MenuItem value="CNY">CNY - Chinese Yuan</MenuItem>
                      <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                    </Select>
                  </FormControl>

                  <IconButton 
                    onClick={() => {
                      setFromCurrency(toCurrency);
                      setToCurrency(fromCurrency);
                    }}
                    sx={{ 
                      p: 1.5,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        transform: 'rotate(180deg)',
                      }
                    }}
                  >
                    <CompareArrows />
                  </IconButton>

                  <FormControl 
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'white',
                      },
                      '& .MuiSelect-icon': {
                        color: 'rgba(255,255,255,0.7)',
                      },
                    }}
                  >
                    <InputLabel>To</InputLabel>
                    <Select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      label="To"
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="GBP">GBP - British Pound</MenuItem>
                      <MenuItem value="ZAR">ZAR - South African Rand</MenuItem>
                      <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
                      <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                      <MenuItem value="CNY">CNY - Chinese Yuan</MenuItem>
                      <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Exchange Rate Display */}
                {exchangeRateData && (
                  <Box sx={{ 
                    mt: 2,
                    p: 3, 
                    bgcolor: 'rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h3" sx={{ 
                      mb: 2,
                      fontWeight: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      <Box component="span" sx={{ opacity: 0.7 }}>
                        {amount} {fromCurrency}
                      </Box>
                      <Box component="span" sx={{ 
                        mx: 2, 
                        fontSize: '0.7em',
                        opacity: 0.5 
                      }}>
                        =
                      </Box>
                      <Box component="span" sx={{ 
                        color: '#FFD700',
                        textShadow: '0 0 10px rgba(255,215,0,0.3)'
                      }}>
                        {(amount * exchangeRateData.rate).toFixed(2)} {toCurrency}
                      </Box>
                    </Typography>

                    <Divider sx={{ 
                      my: 2, 
                      borderColor: 'rgba(255,255,255,0.1)'
                    }} />

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      <Typography variant="body2">
                        1 {fromCurrency} = {exchangeRateData.rate.toFixed(4)} {toCurrency}
                      </Typography>
                      <Typography variant="caption">
                        Last updated: {new Date(exchangeRateData.timestamp * 1000).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Loading State */}
                {isExchangeLoading && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    p: 3
                  }}>
                    <CircularProgress sx={{ color: 'white' }} />
                  </Box>
                )}

                {/* Error State */}
                {exchangeRateError && (
                  <Alert 
                    severity="error"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '& .MuiAlert-icon': {
                        color: 'error.main'
                      }
                    }}
                  >
                    {exchangeRateError instanceof Error 
                      ? exchangeRateError.message 
                      : 'Failed to fetch exchange rate. Please check your internet connection and try again.'}
                  </Alert>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Gold Price Trends Widget */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              minHeight: 400, 
              borderRadius: 2,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
              color: 'white'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="h5">Gold Price Trends</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <ButtonGroup 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      '& .MuiButton-root': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        },
                        '&.active': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        }
                      }
                    }}
                  >
                    {['24h', '7d', '30d', '1y'].map((range) => (
                      <Button
                        key={range}
                        onClick={() => setTimeRange(range as any)}
                        className={timeRange === range ? 'active' : ''}
                      >
                        {range}
                      </Button>
                    ))}
                  </ButtonGroup>

                  <ButtonGroup 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      '& .MuiButton-root': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        },
                        '&.active': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        }
                      }
                    }}
                  >
                    <Button
                      onClick={() => setPriceUnit('oz')}
                      className={priceUnit === 'oz' ? 'active' : ''}
                    >
                      oz
                    </Button>
                    <Button
                      onClick={() => setPriceUnit('g')}
                      className={priceUnit === 'g' ? 'active' : ''}
                    >
                      g
                    </Button>
                  </ButtonGroup>
                </Box>
              </Box>

              {goldPriceData && goldPriceData.length > 0 && (
                <>
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'rgba(0,0,0,0.1)',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>Current Price</Typography>
                      <Typography variant="h4" sx={{ 
                        color: '#FFD700',
                        textShadow: '0 0 10px rgba(255,215,0,0.3)'
                      }}>
                        ${goldPriceData[goldPriceData.length - 1].price}/{priceUnit}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>24h Change</Typography>
                      <Typography variant="h6" sx={{ 
                        color: Number(goldPriceData[goldPriceData.length - 1].price) > Number(goldPriceData[0].price) 
                          ? '#4CAF50' 
                          : '#f44336',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        {Number(goldPriceData[goldPriceData.length - 1].price) > Number(goldPriceData[0].price) ? '↑' : '↓'}
                        {((Number(goldPriceData[goldPriceData.length - 1].price) - Number(goldPriceData[0].price)) / Number(goldPriceData[0].price) * 100).toFixed(2)}%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Price Statistics */}
                  {priceStats && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: 'rgba(0,0,0,0.1)',
                      borderRadius: 1,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: 2
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>High</Typography>
                        <Typography variant="h6" sx={{ color: '#4CAF50' }}>
                          ${priceUnit === 'g' ? convertToGrams(priceStats.high) : priceStats.high.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>Low</Typography>
                        <Typography variant="h6" sx={{ color: '#f44336' }}>
                          ${priceUnit === 'g' ? convertToGrams(priceStats.low) : priceStats.low.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>Average</Typography>
                        <Typography variant="h6">
                          ${priceUnit === 'g' ? convertToGrams(Number(priceStats.avg)) : priceStats.avg}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>Volatility</Typography>
                        <Typography variant="h6">
                          {priceStats.volatility}%
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={goldPriceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="rgba(255,255,255,0.7)"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return timeRange === '24h' 
                              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                          }}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.7)"
                          domain={['auto', 'auto']}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white'
                          }}
                          labelFormatter={(value) => {
                            const date = new Date(value);
                            return timeRange === '24h'
                              ? date.toLocaleTimeString()
                              : date.toLocaleDateString([], { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                });
                          }}
                          formatter={(value: any) => [`$${value}/${priceUnit}`, 'Price']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#FFD700"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, fill: '#FFD700' }}
                          animationDuration={500}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="none"
                          fill="#FFD700"
                          fillOpacity={0.1}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </>
              )}

              {isGoldLoading && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300
                }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              )}

              {goldError && (
                <Alert 
                  severity="error"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    '& .MuiAlert-icon': {
                      color: 'error.main'
                    }
                  }}
                >
                  {goldError instanceof Error 
                    ? goldError.message 
                    : 'Failed to fetch gold price data. Please try again later.'}
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* News Widget */}
          <Grid item xs={12} md={6}>
            <NewsWidget />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default MiningAnalytics;
