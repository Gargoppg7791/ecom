import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Box, 
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider
} from '@mui/material';

const FilterSection = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (field) => (event) => {
    setLocalFilters(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handlePriceChange = (event, newValue) => {
    setLocalFilters(prev => ({ 
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }));
  };

  const handleDiscountChange = (event, newValue) => {
    setLocalFilters(prev => ({ ...prev, minDiscount: newValue }));
  };

  const handleStockChange = (event) => {
    setLocalFilters(prev => ({ 
      ...prev,
      stock: event.target.checked ? "in_stock" : "" 
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      minPrice: '',
      maxPrice: '',
      minDiscount: '',
      stock: '',
      color: '',
      size: '',
      sort: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value !== '');

  return (
    <Box className="bg-white rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h6" className="font-semibold text-gray-900">
          Filters
        </Typography>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-[#b87d3b] hover:text-[#a06c2a] font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Sort */}
        <div>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={localFilters.sort || ''}
              onChange={handleChange('sort')}
              label="Sort By"
            >
              <MenuItem value="">Featured</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Divider />

        {/* Price Range */}
        <div>
          <Typography variant="subtitle2" className="font-medium text-gray-900 mb-4">
            Price Range
          </Typography>
          <Slider
            value={[
              localFilters.minPrice ? Number(localFilters.minPrice) : 0,
              localFilters.maxPrice ? Number(localFilters.maxPrice) : 100000
            ]}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={100000}
            step={1000}
            sx={{
              color: '#b87d3b',
              '& .MuiSlider-thumb': {
                backgroundColor: '#fff',
                border: '2px solid #b87d3b',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(184, 125, 59, 0.16)',
                },
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#e5e7eb',
              },
            }}
          />
          <div className="flex justify-between mt-2 gap-2">
            <TextField
              size="small"
              placeholder="₹ Min"
              type="number"
              value={localFilters.minPrice ?? ''}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  minPrice: e.target.value ? Number(e.target.value) : '',
                }))
              }
              className="w-24"
              InputProps={{
                inputProps: {
                  min: 0,
                  style: { appearance: 'textfield' },
                },
              }}
            />
            <TextField
              size="small"
              placeholder="₹ Max"
              type="number"
              value={localFilters.maxPrice ?? ''}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  maxPrice: e.target.value ? Number(e.target.value) : '',
                }))
              }
              className="w-24"
              InputProps={{
                inputProps: {
                  min: 0,
                  style: { appearance: 'textfield' },
                },
              }}
            />
          </div>
        </div>

        <Divider />

        {/* Discount */}
        <div>
          <Typography variant="subtitle2" className="font-medium text-gray-900 mb-4">
            Minimum Discount
          </Typography>
          <Slider
            value={localFilters.minDiscount || 0}
            onChange={handleDiscountChange}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => `${value}%`}
            min={0}
            max={100}
            step={5}
            sx={{
              color: '#b87d3b',
              '& .MuiSlider-thumb': {
                backgroundColor: '#fff',
                border: '2px solid #b87d3b',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(184, 125, 59, 0.16)',
                },
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#e5e7eb',
              },
            }}
          />
        </div>

        <Divider />

        {/* Stock Status */}
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={localFilters.stock === "in_stock"}
                onChange={handleStockChange}
                sx={{
                  color: '#b87d3b',
                  '&.Mui-checked': {
                    color: '#b87d3b',
                  },
                }}
              />
            }
            label={
              <Typography variant="subtitle2" className="text-gray-900">
                In Stock Only
              </Typography>
            }
          />
        </div>

        <Divider />

        {/* Apply Filters Button */}
        <div className="flex flex-col gap-2">
          <Button
            variant="contained"
            fullWidth
            onClick={handleApplyFilters}
            sx={{
              backgroundColor: '#b87d3b',
              '&:hover': {
                backgroundColor: '#a06c2a',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Apply Filters
          </Button>
          {onClose && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{
                borderColor: '#b87d3b',
                color: '#b87d3b',
                '&:hover': {
                  borderColor: '#a06c2a',
                  backgroundColor: 'rgba(184, 125, 59, 0.04)',
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </Box>
  );
};

export default FilterSection; 