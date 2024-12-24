import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import { CompareArrows, Scale, Square, Speed, Height } from '@mui/icons-material';

interface UnitCategory {
  name: string;
  icon: React.ReactNode;
  units: {
    [key: string]: {
      name: string;
      toBase: (value: number) => number;
      fromBase: (value: number) => number;
    };
  };
}

const unitCategories: { [key: string]: UnitCategory } = {
  weight: {
    name: "Weight",
    icon: <Scale />,
    units: {
      kg: {
        name: "Kilograms",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      g: {
        name: "Grams",
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      mg: {
        name: "Milligrams",
        toBase: (v) => v / 1000000,
        fromBase: (v) => v * 1000000,
      },
      lb: {
        name: "Pounds",
        toBase: (v) => v * 0.453592,
        fromBase: (v) => v / 0.453592,
      },
      oz: {
        name: "Ounces",
        toBase: (v) => v * 0.0283495,
        fromBase: (v) => v / 0.0283495,
      },
      ton: {
        name: "Metric Tons",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
    },
  },
  area: {
    name: "Area",
    icon: <Square />,
    units: {
      m2: {
        name: "Square Meters",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      km2: {
        name: "Square Kilometers",
        toBase: (v) => v * 1000000,
        fromBase: (v) => v / 1000000,
      },
      ha: {
        name: "Hectares",
        toBase: (v) => v * 10000,
        fromBase: (v) => v / 10000,
      },
      ft2: {
        name: "Square Feet",
        toBase: (v) => v * 0.092903,
        fromBase: (v) => v / 0.092903,
      },
      ac: {
        name: "Acres",
        toBase: (v) => v * 4046.86,
        fromBase: (v) => v / 4046.86,
      },
    },
  },
  speed: {
    name: "Speed",
    icon: <Speed />,
    units: {
      mps: {
        name: "Meters per Second",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      kph: {
        name: "Kilometers per Hour",
        toBase: (v) => v / 3.6,
        fromBase: (v) => v * 3.6,
      },
      mph: {
        name: "Miles per Hour",
        toBase: (v) => v * 0.44704,
        fromBase: (v) => v / 0.44704,
      },
    },
  },
  length: {
    name: "Length",
    icon: <Height />,
    units: {
      m: {
        name: "Meters",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      km: {
        name: "Kilometers",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      cm: {
        name: "Centimeters",
        toBase: (v) => v / 100,
        fromBase: (v) => v * 100,
      },
      mm: {
        name: "Millimeters",
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      ft: {
        name: "Feet",
        toBase: (v) => v * 0.3048,
        fromBase: (v) => v / 0.3048,
      },
      in: {
        name: "Inches",
        toBase: (v) => v * 0.0254,
        fromBase: (v) => v / 0.0254,
      },
      yd: {
        name: "Yards",
        toBase: (v) => v * 0.9144,
        fromBase: (v) => v / 0.9144,
      },
      mi: {
        name: "Miles",
        toBase: (v) => v * 1609.34,
        fromBase: (v) => v / 1609.34,
      },
    },
  },
};

const UnitConversionWidget: React.FC = () => {
  const [category, setCategory] = useState<string>("weight");
  const [fromUnit, setFromUnit] = useState<string>(Object.keys(unitCategories.weight.units)[0]);
  const [toUnit, setToUnit] = useState<string>(Object.keys(unitCategories.weight.units)[1]);
  const [value, setValue] = useState<string>("1");
  const [result, setResult] = useState<string>("1000"); // For 1 kg to g

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const units = Object.keys(unitCategories[newCategory].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    handleConversion(value, units[0], units[1], newCategory);
  };

  const handleConversion = (
    val: string,
    from: string = fromUnit,
    to: string = toUnit,
    cat: string = category
  ) => {
    const numValue = parseFloat(val);
    if (isNaN(numValue)) {
      setResult("");
      return;
    }

    const categoryUnits = unitCategories[cat].units;
    const baseValue = categoryUnits[from].toBase(numValue);
    const convertedValue = categoryUnits[to].fromBase(baseValue);
    
    setResult(convertedValue.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0,
    }));
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    handleConversion(value, toUnit, fromUnit);
  };

  return (
    <Paper sx={{ 
      p: 3,
      minHeight: 400,
      borderRadius: 2,
      background: (theme) => `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
      color: 'white'
    }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Unit Conversion</Typography>

      {/* Category Selection */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(unitCategories).map(([key, cat]) => (
          <Grid item key={key}>
            <Paper
              onClick={() => handleCategoryChange(key)}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: category === key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {cat.icon}
              <Typography variant="body2">{cat.name}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Input */}
        <TextField
          label="Value"
          type="number"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleConversion(e.target.value);
          }}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
              '&.Mui-focused fieldset': { borderColor: 'white' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
          }}
        />

        {/* Unit Selection */}
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
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
              '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
            }}
          >
            <InputLabel>From</InputLabel>
            <Select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                handleConversion(value, e.target.value, toUnit);
              }}
              label="From"
            >
              {Object.entries(unitCategories[category].units).map(([key, unit]) => (
                <MenuItem key={key} value={key}>{unit.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton 
            onClick={swapUnits}
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
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
              '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
            }}
          >
            <InputLabel>To</InputLabel>
            <Select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                handleConversion(value, fromUnit, e.target.value);
              }}
              label="To"
            >
              {Object.entries(unitCategories[category].units).map(([key, unit]) => (
                <MenuItem key={key} value={key}>{unit.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Result Display */}
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
              {value} {unitCategories[category].units[fromUnit].name}
            </Box>
            <Box component="span" sx={{ 
              mx: 2, 
              fontSize: '0.7em',
              opacity: 0.5 
            }}>
              =
            </Box>
            <Box component="span">
              {result} {unitCategories[category].units[toUnit].name}
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
              1 {unitCategories[category].units[fromUnit].name} = {
                unitCategories[category].units[toUnit].fromBase(
                  unitCategories[category].units[fromUnit].toBase(1)
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 0,
                })
              } {unitCategories[category].units[toUnit].name}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default UnitConversionWidget;
