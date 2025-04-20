import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import OrderTraker from './OrderTraker';
import TimeLine from './TimeLine';
import api from '../../../config/api';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptIcon from '@mui/icons-material/Receipt';

const OrderTrack = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setOrder(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && jwt) {
      fetchOrderDetails();
    }
  }, [orderId, jwt]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Order not found
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'default';
      case 'PLACED':
        return 'info';
      case 'CONFIRMED':
        return 'success';
      case 'SHIPPED':
        return 'primary';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1a237e', fontWeight: 600 }}>
          Order #{order.id}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#f5f5f5', mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: '#1a237e' }} />
                  <Typography variant="subtitle1">
                    Order Date: {new Date(order.orderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ReceiptIcon sx={{ mr: 1, color: '#1a237e' }} />
                  <Typography variant="subtitle1">
                    Total Amount: ₹{order.totalDiscountedPrice}
                    {order.totalPrice !== order.totalDiscountedPrice && (
                      <Typography component="span" sx={{ textDecoration: 'line-through', ml: 1 }} color="text.secondary">
                        ₹{order.totalPrice}
                      </Typography>
                    )}
                  </Typography>
                </Box>
                {order.discount > 0 && (
                  <Typography variant="subtitle1" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 1, color: 'success.main' }} />
                    You saved: ₹{order.discount}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#f5f5f5', mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalShippingIcon sx={{ mr: 1, color: '#1a237e' }} />
                  <Typography variant="subtitle1">
                    Status: <Chip 
                      label={order.orderStatus} 
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaymentIcon sx={{ mr: 1, color: '#1a237e' }} />
                  <Typography variant="subtitle1">
                    Payment Status: <Chip 
                      label={order.payments?.[0]?.paymentStatus || 'PENDING'} 
                      color={order.payments?.[0]?.paymentStatus === 'COMPLETED' ? 'success' : 'warning'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 600 }}>
              Order Timeline
            </Typography>
            <TimeLine 
              orderStatus={[
                { status: 'Order Placed', date: order.orderDate },
                ...(order.orderStatus !== 'PENDING' ? [{ status: 'Order Confirmed', date: order.orderDate }] : []),
                ...(order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED' 
                  ? [{ status: 'Order Shipped', date: order.orderDate }] : []),
                ...(order.orderStatus === 'DELIVERED' 
                  ? [{ status: 'Order Delivered', date: order.deliveryDate || order.orderDate }] : []),
                ...(order.orderStatus === 'CANCELLED' 
                  ? [{ status: 'Order Cancelled', date: order.updatedAt || order.orderDate }] : [])
              ]} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 600 }}>
              Order Tracker
            </Typography>
            <OrderTraker 
              activeStep={
                order.orderStatus === "PENDING" ? 0
                : order.orderStatus === "PLACED" ? 1
                : order.orderStatus === "CONFIRMED" ? 2
                : order.orderStatus === "SHIPPED" ? 3
                : order.orderStatus === "DELIVERED" ? 4
                : -1
              } 
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 600 }}>
          Order Items
        </Typography>
        <Grid container spacing={2}>
          {order.orderItems.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={item?.product?.color?.[0]?.photos?.[0] 
                        ? `http://localhost:5454/images/${item.product.color[0].photos[0]}`
                        : '/default-product.png'}
                      alt={item.product.title}
                      sx={{ width: 80, height: 80 }}
                      onError={(e) => {
                        if (item?.product?.color?.[0]?.photos?.[1]) {
                          e.target.src = `http://localhost:5454/images/${item.product.color[0].photos[1]}`;
                        } else {
                          e.target.src = '/default-product.png';
                        }
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.product.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Color: {item.product?.color?.[0]?.name || 'N/A'} | Size: {item.size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: ₹{item.price}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default OrderTrack; 