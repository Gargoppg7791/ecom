import React, { useEffect, useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  FormControl,
  InputLabel,
  Menu,
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
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  CircularProgress,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrders, updateOrderStatus, deleteOrder } from "../../../Redux/Admin/Orders/Action";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const OrdersTable = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    status: "", 
    sort: "",
    search: ""
  });
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  
  const { orders, loading: reduxLoading, totalOrders, error: reduxError } = useSelector((store) => {
    console.log("Full Redux Store:", store);
    return {
      orders: store.adminsOrder?.orders || [],
      loading: store.adminsOrder?.loading || false,
      totalOrders: store.adminsOrder?.totalOrders || 0,
      error: store.adminsOrder?.error
    };
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!jwt) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [jwt, page, formData.status, formData.sort]);

  const fetchOrders = async () => {
    try {
      setError(null);
      console.log("Fetching orders with params:", { 
        page, 
        status: formData.status, 
        sort: formData.sort,
        jwt: jwt ? "Present" : "Missing"
      });
      
      await dispatch(getOrders({ 
        jwt, 
        page, 
        status: formData.status, 
        sort: formData.sort 
      }));
    } catch (error) {
      console.error("Error in fetchOrders:", error);
      setError("Failed to fetch orders");
    }
  };

  const handleStatusUpdate = async (status) => {
    if (selectedOrder) {
      try {
        await dispatch(updateOrderStatus(selectedOrder.id, status.toLowerCase()));
        toast.success('Order status updated successfully');
        handleMenuClose();
        await fetchOrders();
      } catch (error) {
        setError("Failed to update order status");
        toast.error(error.message || 'Failed to update order status');
      }
    }
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) {
      setError("No order selected for deletion");
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await dispatch(deleteOrder(selectedOrder.id));
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
      toast.success('Order deleted successfully');
      await fetchOrders();
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to delete order');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleMenuClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setFormData({ ...formData, search: event.target.value });
  };

  const handleSortChange = (event) => {
    setFormData({ ...formData, sort: event.target.value });
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setFormData({ ...formData, status: event.target.value });
    setPage(0);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const filteredOrders = orders.filter(order => {
    const searchTerm = formData.search.toLowerCase();
    return (
      order.id.toString().includes(searchTerm) ||
      order.user?.firstName?.toLowerCase().includes(searchTerm) ||
      order.user?.lastName?.toLowerCase().includes(searchTerm) ||
      order.orderStatus.toLowerCase().includes(searchTerm)
    );
  });

  if (reduxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {reduxError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {reduxError}
        </Alert>
      )}

      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search orders..."
              value={formData.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleStatusChange}
                label="Status"
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PLACED">Placed</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={formData.sort}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="">Default</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Photo</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow hover key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      {order.orderItems?.[0]?.product?.imageUrl ? (
                        <Box
                          component="img"
                          src={order.orderItems[0].product.imageUrl}
                          alt="Order Item"
                          sx={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {order.orderItems?.[0]?.product?.title || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.orderItems?.[0]?.product?.brand || ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        #{order.userId}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderStatus}
                        color={
                          order.orderStatus === 'DELIVERED' ? 'success' :
                          order.orderStatus === 'CANCELLED' ? 'error' :
                          order.orderStatus === 'PENDING' ? 'warning' :
                          'primary'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatPrice(order.totalDiscountedPrice)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="More actions">
                          <IconButton onClick={(e) => handleMenuClick(e, order)}>
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete order">
                          <IconButton onClick={() => handleDeleteClick(order)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalOrders}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-selectLabel': {
              marginTop: '1em'
            },
            '.MuiTablePagination-displayedRows': {
              marginTop: '1em'
            }
          }}
        />
      </Paper>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusUpdate('PENDING')}>Pending</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('PLACED')}>Placed</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('DELIVERED')}>Delivered</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('CANCELLED')}>Cancelled</MenuItem>
      </Menu>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this order? This action cannot be undone.
          </Typography>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={reduxLoading}
          >
            {reduxLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersTable;