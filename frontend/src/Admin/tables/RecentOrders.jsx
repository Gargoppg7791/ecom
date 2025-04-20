import React, { useEffect, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardHeader,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders, updateOrderStatus } from '../../Redux/Admin/Orders/Action';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const RecentOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((store) => {
    console.log("Full Redux Store:", store);
    return {
      orders: store.adminsOrder?.orders || [],
      loading: store.adminsOrder?.loading || false
    };
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      dispatch(getOrders({ jwt }));
    }
  }, [dispatch]);

  const handleStatusUpdate = async (status) => {
    if (selectedOrder) {
      try {
        await dispatch(updateOrderStatus(selectedOrder.id, status.toLowerCase()));
        toast.success('Order status updated successfully');
        handleMenuClose();
      } catch (error) {
        toast.error(error.message || 'Failed to update order status');
      }
    }
  };

  const handleMenuClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader
        title="Recent Orders"
        sx={{ pt: 2, alignItems: 'center', '& .MuiCardHeader-action': { mt: 0.6 } }}
        action={
          <Typography
            onClick={() => navigate('/admin/orders')}
            variant="caption"
            sx={{ color: 'blue', cursor: 'pointer', paddingRight: '.8rem' }}
          >
            View All
          </Typography>
        }
        titleTypographyProps={{
          variant: 'h5',
          sx: { lineHeight: '1.6 !important', letterSpacing: '0.15px !important' },
        }}
      />
      <TableContainer>
        <Table sx={{ minWidth: 730 }} aria-label="table in dashboard">
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <TableRow
                  hover
                  key={order.id}
                  sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                >
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <AvatarGroup max={4} sx={{ justifyContent: 'start' }}>
                      {order.orderItems?.map((orderItem) => (
                        <Avatar 
                          key={orderItem.id}
                          alt={orderItem.product?.title} 
                          src={orderItem.product?.color?.[0]?.photos?.[0]} 
                        />
                      ))}
                    </AvatarGroup>
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
                  <TableCell>{formatPrice(order.totalDiscountedPrice)}</TableCell>
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
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="More actions">
                        <IconButton onClick={(e) => handleMenuClick(e, order)}>
                          <MoreVertIcon />
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
    </Card>
  );
};

export default RecentOrders;