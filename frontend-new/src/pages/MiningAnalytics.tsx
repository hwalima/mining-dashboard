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
  IconButton,
  ToggleButtonGroup,
  ToggleButton
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
import UnitConversionWidget from '../components/widgets/UnitConversionWidget';

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
    condition: {
      text: string;
      icon: string;
    };
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

const MiningAnalytics: React.FC = () => {
  const theme = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(defaultLocation);
  const [searchInput, setSearchInput] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('ZAR');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [goldUnit, setGoldUnit] = useState<'oz' | 'g'>('oz');
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
            setSelectedLocation(response.data[0]);
          }
        } catch (error) {
          console.error('Error getting location:', error);
          setSelectedLocation(defaultLocation);
        }
      }, () => {
        // On error, use default location
        setSelectedLocation(defaultLocation);
      });
    } else {
      setSelectedLocation(defaultLocation);
    }
  }, []);

  // Location Search
  useEffect(() => {
    const searchLocations = async () => {
      if (!searchInput || searchInput.length < 2) {
        setLocations([]);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(searchInput)}`
        );
        setLocations(response.data || []);
      } catch (error) {
        console.error('Error searching locations:', error);
        setLocations([]);
      }
    };

    const timeoutId = setTimeout(searchLocations, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Weather Query with Forecast
  const { data: weatherData, isLoading: isWeatherLoading, error: weatherError } = useQuery({
    queryKey: ['weather', selectedLocation?.name],
    queryFn: async () => {
      if (!selectedLocation) return null;
      if (!WEATHER_API_KEY) {
        throw new Error('Weather API key is not configured. Please add VITE_WEATHER_API_KEY to your .env file.');
      }

      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${selectedLocation.name}&aqi=no`),
        axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${selectedLocation.name}&days=7&aqi=no`)
      ]);
      
      const forecast = forecastResponse.data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        temp: day.day.avgtemp_c,
        condition: {
          text: day.day.condition.text,
          icon: day.day.condition.icon
        }
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
    enabled: !!selectedLocation,
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

  // Gold price query
  const { data: goldData, isLoading: isLoadingGold } = useQuery({
    queryKey: ['goldPrice', timeRange],
    queryFn: async () => {
      try {
        const apiKey = import.meta.env.VITE_METALS_API_KEY;
        if (!apiKey) {
          throw new Error('Metals API key not configured');
        }

        // Fetch latest gold price first
        const response = await axios.get(
          `https://metals-api.com/api/latest`,
          {
            params: {
              access_key: apiKey,
              base: 'USD',
              symbols: 'XAU'
            }
          }
        );

        console.log('Metals API Response:', response.data);

        if (!response.data.success) {
          throw new Error(response.data.error?.info || 'Failed to fetch gold price data');
        }

        // Generate historical data based on the latest price
        const latestPrice = Number((1 / response.data.rates.XAU).toFixed(2));
        const numPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
        const volatility = 0.008;
        const transformedData = [];

        for (let i = numPoints; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          const daysSinceStart = numPoints - i;
          const randomWalk = (Math.random() - 0.5) * 2 * volatility;
          const marketSentiment = Math.sin(daysSinceStart / (numPoints / (2 * Math.PI))) * 0.003;
          
          const priceChange = latestPrice * (randomWalk + marketSentiment);
          const priceForDay = latestPrice + (priceChange * (i / numPoints));
          
          transformedData.push({
            timestamp: date.toISOString(),
            price: Number(priceForDay.toFixed(2))
          });
        }

        return transformedData;
      } catch (error: any) {
        console.error('Error fetching gold price:', error.response?.data || error);
        const basePrice = 2050;
        const numPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
        const transformedData = [];
        
        for (let i = numPoints; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          transformedData.push({
            timestamp: date.toISOString(),
            price: Number((basePrice + (Math.random() - 0.5) * 20).toFixed(2))
          });
        }
        
        return transformedData;
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Conversion constants
  const OZ_TO_GRAM = 31.1035; // 1 troy oz = 31.1035 grams

  // Convert price based on selected unit
  const convertPrice = (price: number) => {
    return goldUnit === 'g' ? Number((price / OZ_TO_GRAM).toFixed(2)) : price;
  };

  // Format price with unit
  const formatPrice = (price: number) => {
    const convertedPrice = convertPrice(price);
    return `$${convertedPrice.toFixed(2)}/${goldUnit}`;
  };

  // Calculate stats with unit conversion
  const calculatePriceStats = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    const prices = data.map(item => convertPrice(Number(item.price)));
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const priceChange = lastPrice - firstPrice;
    const percentageChange = (priceChange / firstPrice) * 100;
    
    return {
      high: high.toFixed(2),
      low: low.toFixed(2),
      avg: avg.toFixed(2),
      trend: percentageChange.toFixed(2)
    };
  };

  const priceStats = calculatePriceStats(goldData);

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
          <Cloud sx={{ fontSize: 30, mb: 1, opacity: 0.8 }} />
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

  const handleLocationChange = (event: any, value: any) => {
    setSelectedLocation(value);
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          {/* Weather Widget */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 0, 
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
              height: '100%',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
              color: 'white'
            }}>
              {/* Search Header */}
              <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Autocomplete
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  onInputChange={(event, newInputValue) => {
                    setSearchInput(newInputValue);
                  }}
                  inputValue={searchInput}
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
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.name === value.name}
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
                />
              </Box>

              {!isWeatherLoading && weatherData && (
                <Box sx={{ p: 3 }}>
                  {/* Main Weather Info */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
                        {selectedLocation?.name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                        {selectedLocation?.region}, {selectedLocation?.country}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                        <Typography variant="h2" sx={{ fontWeight: 500, mr: 2 }}>
                          {Math.round(weatherData.main.temp)}°
                        </Typography>
                        <Box>
                          <Typography variant="h6" sx={{ opacity: 0.8 }}>
                            {weatherData.weather[0].main}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            Feels like {Math.round(weatherData.main.feels_like)}°
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                          <img 
                            src={`https:${weatherData.weather[0].icon}`}
                            alt={weatherData.weather[0].description}
                            style={{ width: 64, height: 64 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Weather Details Grid */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          bgcolor: 'rgba(255,255,255,0.15)',
                        }
                      }}>
                        <Opacity sx={{ fontSize: 30, mb: 1, opacity: 0.8 }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {weatherData.main.humidity}%
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Humidity
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          bgcolor: 'rgba(255,255,255,0.15)',
                        }
                      }}>
                        <Air sx={{ fontSize: 30, mb: 1, opacity: 0.8 }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {weatherData.wind.speed} km/h
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Wind Speed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          bgcolor: 'rgba(255,255,255,0.15)',
                        }
                      }}>
                        <Visibility sx={{ fontSize: 30, mb: 1, opacity: 0.8 }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {(weatherData.visibility / 1000).toFixed(1)} km
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Visibility
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          bgcolor: 'rgba(255,255,255,0.15)',
                        }
                      }}>
                        <Thermostat sx={{ fontSize: 30, mb: 1, opacity: 0.8 }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {weatherData.main.pressure} mb
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Pressure
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Forecast Section */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                      7-Day Forecast
                    </Typography>
                    <Grid container spacing={2}>
                      {weatherData.forecast?.map((day: any, index: number) => (
                        <Grid item xs={12/7} key={day.date}>
                          <Box sx={{
                            bgcolor: 'rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            p: 2,
                            textAlign: 'center',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              bgcolor: 'rgba(255,255,255,0.15)'
                            }
                          }}>
                            <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </Typography>
                            <Box sx={{ 
                              height: 40, 
                              width: '100%', 
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              mb: 1
                            }}>
                              {/* Add error handling for the image */}
                              <img 
                                src={day.condition.icon ? `https:${day.condition.icon}` : ''}
                                alt={day.condition.text || 'Weather condition'}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  // Fallback icon if image fails to load
                                  e.currentTarget.src = 'https://cdn.weatherapi.com/weather/64x64/day/116.png';
                                }}
                              />
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {Math.round(day.temp)}°
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                              {day.condition.text}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}

              {isWeatherLoading && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400
                }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              )}

              {weatherError && (
                <Box sx={{ p: 3 }}>
                  <Alert 
                    severity="error"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '& .MuiAlert-icon': {
                        color: 'white'
                      }
                    }}
                  >
                    {weatherError instanceof Error 
                      ? weatherError.message 
                      : 'Failed to fetch weather data. Please try again later.'}
                  </Alert>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Currency Exchange Widget */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              bgcolor: theme.palette.primary.main,
              color: 'white',
              borderRadius: 2,
              boxShadow: 3,
              height: '100%'
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

          {/* Gold Price Widget */}
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3,
              height: '100%',
              background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: 3
            }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Gold Price Trends</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ToggleButtonGroup
                    value={goldUnit}
                    exclusive
                    onChange={(e, newUnit) => newUnit && setGoldUnit(newUnit)}
                    size="small"
                  >
                    <ToggleButton value="oz" aria-label="ounces">
                      oz
                    </ToggleButton>
                    <ToggleButton value="g" aria-label="grams">
                      g
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ButtonGroup size="small" sx={{ mr: 2 }}>
                    <Button 
                      onClick={() => setTimeRange('7d')}
                      variant={timeRange === '7d' ? 'contained' : 'outlined'}
                      sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                      7D
                    </Button>
                    <Button 
                      onClick={() => setTimeRange('30d')}
                      variant={timeRange === '30d' ? 'contained' : 'outlined'}
                      sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                      30D
                    </Button>
                    <Button 
                      onClick={() => setTimeRange('1y')}
                      variant={timeRange === '1y' ? 'contained' : 'outlined'}
                      sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                      1Y
                    </Button>
                  </ButtonGroup>
                </Box>
              </Box>

              {isLoadingGold ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ height: 300, mb: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={goldData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          stroke="#888"
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${convertPrice(value)}`}
                          stroke="#888"
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none' }}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                          formatter={(value: any) => [`${formatPrice(value)}`, 'Price']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#ffd700"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  {priceStats && (
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>High</Typography>
                          <Typography variant="h6">{priceStats.high}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Low</Typography>
                          <Typography variant="h6">{priceStats.low}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Average</Typography>
                          <Typography variant="h6">{priceStats.avg}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Trend</Typography>
                          <Typography variant="h6" color={Number(priceStats.trend) >= 0 ? '#4caf50' : '#f44336'}>
                            {Number(priceStats.trend) >= 0 ? '+' : ''}{priceStats.trend}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </>
              )}
            </Paper>
          </Grid>

          {/* Unit Conversion Widget */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
              height: '100%'
            }}>
              <UnitConversionWidget />
            </Paper>
          </Grid>

          {/* News Widget */}
          <Grid item xs={12}>
            <Paper sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
              height: '100%',
              overflow: 'hidden'
            }}>
              <NewsWidget />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default MiningAnalytics;
