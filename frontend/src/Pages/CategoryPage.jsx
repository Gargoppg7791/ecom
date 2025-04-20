import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/api';
import ProductCard from '../customer/Components/Product/ProductCard/ProductCard';
import { CircularProgress, Box, IconButton, Drawer, useMediaQuery, useTheme } from '@mui/material';
import FilterSection from '../customer/Components/Product/FilterSection/FilterSection';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minDiscount: '',
    stock: '',
    color: '',
    size: '',
    sort: ''
  });

  const fetchCategoryAndProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.minDiscount) queryParams.append('minDiscount', filters.minDiscount);
      if (filters.stock) queryParams.append('stock', filters.stock);
      if (filters.color) queryParams.append('color', filters.color);
      if (filters.size) queryParams.append('size', filters.size);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const categoryResponse = await api.get(`/api/categories/${categoryId}?${queryParams.toString()}`);
      setCategory(categoryResponse.data);
      
      const processedProducts = categoryResponse.data.products.map(product => ({
        ...product,
        imageUrl: product.imageUrl || '6faae63a-7263-4e6a-a398-3c11d312fde2-1742945819659.jpg',
        rating: product.ratings?.length > 0 
          ? (product.ratings.reduce((acc, curr) => acc + parseFloat(curr.rating), 0) / product.ratings.length).toFixed(1)
          : 0,
        ratingCount: product.ratings?.length || 0
      }));
      
      setProducts(processedProducts);
    } catch (error) {
      console.error('Error fetching category and products:', error);
      setError(error.response?.data?.error || 'Failed to fetch category products');
    } finally {
      setLoading(false);
    }
  }, [categoryId, filters]);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndProducts();
    }
  }, [categoryId, fetchCategoryAndProducts]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (isMobile) {
      setIsFilterOpen(false);
    }
  }, [isMobile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress sx={{ color: '#b87d3b' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 px-4">
        <p className="text-center mb-4">{error}</p>
        <button 
          onClick={() => fetchCategoryAndProducts()}
          className="px-4 py-2 bg-[#b87d3b] text-white rounded-lg hover:bg-[#a06c2a] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {category?.name || 'Category Products'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </p>
          </div>
          
          {isMobile && (
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
            >
              <FilterListIcon fontSize="small" />
              <span>Filters</span>
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filters Section */}
          {isMobile ? (
            <Drawer
              anchor="right"
              open={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              PaperProps={{
                sx: {
                  width: '100%',
                  maxWidth: '320px',
                  p: 2
                }
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <IconButton onClick={() => setIsFilterOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </div>
              <FilterSection 
                filters={filters} 
                onFilterChange={handleFilterChange}
                products={products}
                onClose={() => setIsFilterOpen(false)}
              />
            </Drawer>
          ) : (
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-4">
                <FilterSection 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                  products={products}
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-grow">
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-4">No products found in this category.</p>
                <button 
                  onClick={() => setFilters({
                    minPrice: '',
                    maxPrice: '',
                    minDiscount: '',
                    stock: '',
                    color: '',
                    size: '',
                    sort: ''
                  })}
                  className="text-[#b87d3b] hover:text-[#a06c2a] font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {products.map((product) => (
                  <div key={product.id} className="flex">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CategoryPage); 