import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  FormControl,
  Grid,
  Stack,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Chip,
} from "@mui/material";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EditProductModal from "./EditProductModal";
import { deleteProduct, findProducts, updateProduct } from "../../../Redux/Customers/Product/Action";
import './ProductsTable.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const ProductRow = React.memo(({ item, handleEditProduct, handleDeleteProduct, getProductImage, formatDate }) => {
  const totalQuantity = item.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
  
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
  };
  
  const stockDisplay = useMemo(() => {
    if (totalQuantity === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Chip
            label="Out of Stock"
            color="error"
            size="small"
            sx={{ 
              fontWeight: 500,
              minWidth: '100px'
            }}
          />
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Chip
          label="In Stock"
          color="success"
          size="small"
          sx={{ 
            fontWeight: 500,
            minWidth: '100px'
          }}
        />
        <Typography variant="body2" color="text.secondary">
          ({totalQuantity})
        </Typography>
      </Box>
    );
  }, [totalQuantity]);

  return (
    <TableRow 
      key={item.id}
      sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
    >
      <TableCell>
        <Avatar
          alt={item.title}
          src={getProductImage(item)}
          className="products-avatar"
          variant="rounded"
          onError={handleImageError}
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography className="products-title">
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.brand}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="center">
        {item.category?.name || item.topLevelCategory}
      </TableCell>
      <TableCell align="center">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography className="products-price" sx={{ fontWeight: 500 }}>
            ₹{item.discountedPrice}
          </Typography>
          {item.price !== item.discountedPrice && (
            <Typography
              variant="caption"
              className="products-price-discount"
              sx={{ textDecoration: 'line-through' }}
            >
              ₹{item.price}
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell align="center">
        {stockDisplay}
      </TableCell>
      <TableCell align="center">
        {formatDate(item.createdAt)}
      </TableCell>
      <TableCell align="center">
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleEditProduct(item)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDeleteProduct(item.id)}
          >
            Delete
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
});

const ProductsTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customersProduct } = useSelector((store) => store);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    availability: searchParams.get("availability") || "",
    sort: searchParams.get("sort") || "newest",
    page: parseInt(searchParams.get("page")) || 1,
    pageSize: parseInt(searchParams.get("pageSize")) || 10
  });

  const handleEditProduct = useCallback((product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleSaveEdit = useCallback(async (updatedProduct) => {
    try {
      // Extract product ID from FormData
      const productId = updatedProduct.get('id');
      if (!productId) {
        console.error('Product ID is missing');
        return;
      }

      // Log FormData contents
      console.log("Updated Product Data:");
      for (let [key, value] of updatedProduct.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Create a new FormData with the correct structure
      const productData = {
        id: productId,
        data: updatedProduct
      };

      await dispatch(updateProduct(productData));
      handleCloseEditModal();
      // Refresh the product list
      dispatch(findProducts({
        search: filters.search,
        pageNumber: filters.page,
        pageSize: filters.pageSize,
        sort: filters.sort,
        stock: filters.availability === "in_stock" ? true :
          filters.availability === "out_of_stock" ? false : undefined
      }));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }, [dispatch, filters, handleCloseEditModal]);

  const sortedAndFilteredProducts = useMemo(() => {
    let products = customersProduct?.products?.content || [];
    
    // Apply availability filter
    if (filters.availability === "in_stock") {
      products = products.filter(product => {
        const totalQuantity = product.sizes?.reduce((sum, size) => sum + (size.quantity || 0), 0) || 0;
        return totalQuantity > 0;
      });
    } else if (filters.availability === "out_of_stock") {
      products = products.filter(product => {
        const totalQuantity = product.sizes?.reduce((sum, size) => sum + (size.quantity || 0), 0) || 0;
        return totalQuantity === 0;
      });
    }

    // Apply sorting
    if (filters.sort === "oldest") {
      return [...products].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [customersProduct?.products?.content, filters.sort, filters.availability]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: key === "pageSize" ? 1 : filters.page
    };

    setFilters(newFilters);

    if (value) {
      searchParams.set(key, value.toString());
    } else {
      searchParams.delete(key);
    }

    if (key === "pageSize") {
      searchParams.set("page", "1");
    }

    navigate({ search: `?${searchParams.toString()}` });
  }, [filters, navigate, searchParams]);


  const handlePaginationChange = useCallback((_, value) => {
    setFilters(prev => ({ ...prev, page: value }));
    searchParams.set("page", value.toString());
    navigate({ search: `?${searchParams.toString()}` });
  }, [navigate, searchParams]);

  const handleDeleteProduct = useCallback(async (productId) => {
    try {
      // Wait for the delete operation to complete
      await dispatch(deleteProduct(productId));
      
      // Only refresh the product list after successful deletion
      await dispatch(findProducts({
        search: filters.search,
        pageNumber: filters.page,
        pageSize: filters.pageSize,
        sort: filters.sort,
        stock: filters.availability === "in_stock" ? true :
          filters.availability === "out_of_stock" ? false : undefined
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      // You might want to show an error message to the user here
    }
  }, [dispatch, filters]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getProductImage = useCallback((product) => {
    const baseUrl = '/api/images';
    const defaultImage = 'default.jpg';
  
    try {
      // Check if product and color array exist
      if (product && product.color && product.color.length > 0) {
        const firstColor = product.color[0];
        
        // Check if photos array exists and has items
        if (firstColor.photos && firstColor.photos.length > 0) {
          const photoName = firstColor.photos[0];
          
          // Handle full URLs
          if (photoName.startsWith('http')) {
            return photoName;
          }
        
          return `${baseUrl}/${photoName}`;
        }
      }
      
      return `${baseUrl}/${defaultImage}`;
    } catch (error) {
      return `${baseUrl}/${defaultImage}`;
    }
  }, []);

  const handleImageError = useCallback((e) => {
    e.target.src = '/api/images/default.jpg';
    e.target.onerror = null; // Prevent infinite loop
  }, []);

  useEffect(() => {
    const fetchData = {
      search: filters.search,
      pageNumber: filters.page,
      pageSize: filters.pageSize,
      sort: filters.sort,
      availability: filters.availability
    };
  
    dispatch(findProducts(fetchData));
  }, [dispatch, filters.search, filters.availability, filters.page, filters.pageSize, filters.sort]);
  return (
    <Box className="products-container">
      <Card className="products-card">
        <CardHeader
          title="Products"
          className="products-card-header"
        />
        <Grid container spacing={3}> {/* Increased spacing between grid items */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Products"
              placeholder="Search by title, category, brand..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3}>
          <FormControl fullWidth>
  <InputLabel>Availability</InputLabel>
  <Select
    value={filters.availability}
    label="Availability"
    onChange={(e) => handleFilterChange("availability", e.target.value)}
  >
    <MenuItem value="">All</MenuItem>
    <MenuItem value="in_stock">In Stock</MenuItem>
    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
  </Select>
</FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sort}
                label="Sort By"
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Items Per Page</InputLabel>
              <Select
                value={filters.pageSize}
                label="Items Per Page"
                onChange={(e) => handleFilterChange("pageSize", e.target.value)}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size} Items
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      <Card className="products-card">
        <CardHeader
          title="All Products"
          className="products-card-header"
        />
        <TableContainer className="products-table-container">
          <Table className="products-table">
            <TableHead className="products-table-head">
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="center">Category</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Total Stock</TableCell>
                <TableCell align="center">Created At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAndFilteredProducts.map((item) => (
                <ProductRow
                  key={item.id}
                  item={item}
                  handleEditProduct={handleEditProduct}
                  handleDeleteProduct={handleDeleteProduct}
                  getProductImage={getProductImage}
                  formatDate={formatDate}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Card className="products-card">
        <Box className="products-pagination">
          <Pagination
            count={customersProduct.products?.totalPages || 1}
            color="primary"
            onChange={handlePaginationChange}
            page={filters.page}
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      </Card>
      <EditProductModal
        open={editModalOpen}
        handleClose={handleCloseEditModal}
        product={selectedProduct}
        onSave={handleSaveEdit}
      />
    </Box>
  );
};

export default React.memo(ProductsTable);