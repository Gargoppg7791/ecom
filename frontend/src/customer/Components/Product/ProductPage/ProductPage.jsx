import React, { useState, useEffect } from "react";
import ProductCard from "../ProductCard/ProductCard";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  CircularProgress,
  Pagination,
  Slider,
  FormControlLabel,
  Checkbox,
  Rating
} from "@mui/material";
import api from "../../../../config/api";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [inStock, setInStock] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const PAGE_SIZE = 12;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        // Filter to get only level 2 categories
        const level2Categories = response.data.filter(cat => cat.level === 2);
        console.log("Fetched categories:", level2Categories);
        setCategories(level2Categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("categoryId");
    const page = parseInt(params.get("page")) || 1;
    const sort = params.get("sort") || "rating";
    const minPrice = parseInt(params.get("minPrice")) || 0;
    const maxPrice = parseInt(params.get("maxPrice")) || 50000;
    const stock = params.get("inStock") === "true";
    const rating = parseFloat(params.get("minRating")) || 0;
    const discounted = params.get("discounted") === "true";

    console.log("URL Parameters:", {
      categoryId: category,
      page,
      sort,
      minPrice,
      maxPrice,
      stock,
      rating,
      discounted
    });

    setSelectedCategory(category || "");
    setCurrentPage(page);
    setSortBy(sort);
    setPriceRange([minPrice, maxPrice]);
    setInStock(stock);
    setMinRating(rating);
    setDiscountedOnly(discounted);
  }, [location.search]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let sort;
        switch (sortBy) {
          case "price_low":
            sort = "price";
            break;
          case "price_high":
            sort = "price,desc";
            break;
          case "newest":
            sort = "createdAt,desc";
            break;
          case "discount":
            sort = "discountPercent,desc";
            break;
          default:
            sort = "rating,desc";
        }

        const queryParams = {
          sort: sort,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          pageSize: PAGE_SIZE,
          pageNumber: currentPage - 1,
          inStock: inStock,
          minRating: minRating,
          discounted: discountedOnly
        };

        // Only add categoryId if a category is selected
        if (selectedCategory) {
          queryParams.categoryId = selectedCategory;
        }

        console.log("API Request Parameters:", queryParams);

        const response = await api.get("/api/products", {
          params: queryParams
        });

        console.log("API Response:", response.data);
        setProducts(response.data.content);
        setTotalPages(Math.ceil(response.data.totalElements / PAGE_SIZE));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy, priceRange, selectedCategory, currentPage, inStock, minRating, discountedOnly]);

  // Add back the updateURL effect
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (sortBy !== "rating") params.set("sort", sortBy);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 50000) params.set("maxPrice", priceRange[1].toString());
    if (inStock) params.set("inStock", "true");
    if (minRating > 0) params.set("minRating", minRating.toString());
    if (discountedOnly) params.set("discounted", "true");
    
    const url = `?${params.toString()}`;
    console.log("Updating URL to:", url);
    navigate(url, { replace: true });
  }, [sortBy, priceRange, selectedCategory, currentPage, inStock, minRating, discountedOnly]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setCurrentPage(1);
  };

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    console.log("Selected category:", categoryId);
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Loading Skeleton
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
      <div className="mt-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );

  return (
    <div className="px-10 -z-10">
      {/* heading part */}
      <div className="flex justify-between items-center py-5">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-4">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label="Sort By">
              <MenuItem value="rating">Rating: High to Low</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="discount">Highest Discount</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* bottom part */}
      <div className="flex justify-between">
        {/* filter */}
        <div className="w-[20%] border rounded-md bg-white p-4">
          <h2 className="font-bold mb-4">Filters</h2>
          
          {/* Category Filter */}
          <div className="mb-6">
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={selectedCategory || ""} onChange={handleCategoryChange} label="Category">
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Price Range Slider */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Price Range</h3>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={50000}
              step={1000}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Minimum Rating</h3>
            <Rating
              value={minRating}
              onChange={(event, newValue) => {
                setMinRating(newValue);
                setCurrentPage(1);
              }}
              precision={0.5}
            />
          </div>

          {/* Additional Filters */}
          <div className="space-y-2">
            <FormControlLabel
              control={
                <Checkbox
                  checked={inStock}
                  onChange={(e) => {
                    setInStock(e.target.checked);
                    setCurrentPage(1);
                  }}
                />
              }
              label="In Stock Only"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={discountedOnly}
                  onChange={(e) => {
                    setDiscountedOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                />
              }
              label="Discounted Items"
            />
          </div>
        </div>

        {/* products */}
        <div className="w-[78%] bg-white border rounded-md p-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-8">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
