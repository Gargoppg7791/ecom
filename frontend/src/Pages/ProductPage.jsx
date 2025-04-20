import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import ProductCard from '../customer/Components/Product/ProductCard/ProductCard';
import { CircularProgress, Box } from '@mui/material';
import FilterSection from '../customer/Components/Product/FilterSection/FilterSection';

// Cache for storing products data
const cache = {
  data: null,
  timestamp: null,
  filters: null,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

const ProductPage = () => {
  const [products, setProducts] = useState(() => cache.data || []);
  const [loading, setLoading] = useState(!cache.data);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(() => cache.filters || {
    minPrice: '',
    maxPrice: '',
    minDiscount: '',
    stock: '',
    sort: ''
  });

  // Memoize the query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minDiscount) params.append('minDiscount', filters.minDiscount);
    if (filters.stock) params.append('stock', filters.stock);
    if (filters.sort) params.append('sort', filters.sort);
    return params.toString();
  }, [filters]);

  const fetchProducts = useCallback(async (forceFetch = false) => {
    // Check cache validity
    const now = Date.now();
    if (!forceFetch && 
        cache.data && 
        cache.timestamp && 
        (now - cache.timestamp < cache.CACHE_DURATION) &&
        JSON.stringify(cache.filters) === JSON.stringify(filters)) {
      setProducts(cache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/products?${queryParams}`);
      const newProducts = response.data.content || [];
      
      // Update cache
      cache.data = newProducts;
      cache.timestamp = now;
      cache.filters = { ...filters };
      
      setProducts(newProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.error || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [queryParams, filters]);

  // Effect for initial load and filter changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      // Only clear cache if it's older than CACHE_DURATION
      const now = Date.now();
      if (cache.timestamp && (now - cache.timestamp > cache.CACHE_DURATION)) {
        cache.data = null;
        cache.timestamp = null;
        cache.filters = null;
      }
    };
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Memoize the product cards to prevent unnecessary re-renders
  const productGrid = useMemo(() => {
    if (products.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="flex justify-center">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">All Products</h1>
      
      <div className="flex gap-8">
        <div className="w-72 flex-shrink-0">
          <FilterSection 
            filters={filters} 
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="flex-grow">
          {productGrid}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductPage); 