import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const OrderConfirm = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/account/order');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 2,
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            Order Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for your purchase. Your order has been successfully placed.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You will receive an email confirmation shortly with your order details.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleViewOrders}
            >
              View Orders
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default OrderConfirm; 