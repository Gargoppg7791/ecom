import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import api, { API_BASE_URL } from '../config/api';
import ProductCard from '../customer/Components/Product/ProductCard/ProductCard';
import { CircularProgress, Pagination, Box } from '@mui/material';
import FilterSection from '../customer/Components/Product/FilterSection/FilterSection';

const SearchResults = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minDiscount: '',
    stock: '',
    color: '',
    size: '',
    sort: '',
    pageSize: 12
  });

  useEffect(() => {
    const query = searchParams.get('query');
    console.log('Search query:', query);
    console.log('Current filters:', filters);

    const fetchSearchResults = async () => {
      if (!query) {
        console.log('No query provided');
        setError('No search query provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          query: query.trim(),  // Trim whitespace
          pageNumber: currentPage,
          pageSize: filters.pageSize,
          ...filters
        });

        const url = `/api/products/search?${params.toString()}`;
        console.log('Making API request to:', url);
        
        const response = await api.get(url);
        console.log('Search response:', response.data);
        
        if (response.data.content.length === 0) {
          console.log('No products found in response');
        }
        
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError(error.response?.data?.error || 'Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [location.search, currentPage, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

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
      <h1 className="text-2xl font-bold mb-8">
        Search Results for "{searchParams.get('query')}"
      </h1>
      
      <div className="flex gap-8">
        {/* Filters Section */}
        <div className="w-72 flex-shrink-0">
          <FilterSection 
            filters={filters} 
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-grow">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found for your search.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="flex justify-center">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <Box className="flex justify-center mt-12">
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;