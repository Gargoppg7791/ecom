import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDispatch } from "react-redux";
import { updatePaymentStatus, getOrderById } from "../../../Redux/Customers/Order/Action";
import { clearCart } from "../../../Redux/Customers/Cart/Action";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

// Lazy load components
const OrderTraker = lazy(() => import("../orders/OrderTraker"));
const AddressCard = lazy(() => import("../adreess/AdreessCard"));

const OrderItem = React.memo(({ item }) => {
  const imageUrl = useMemo(() => {
    const photo = item.product?.color?.[0]?.photos?.[0];
    return photo ? `http://localhost:5454/images/${photo}` : null;
  }, [item.product?.color]);

  const [imgSrc, setImgSrc] = useState(imageUrl);

  useEffect(() => {
    setImgSrc(imageUrl);
  }, [imageUrl]);

  const handleImageError = () => {
    const fallbackPhoto = item.product?.color?.[0]?.photos?.[1];
    if (fallbackPhoto) {
      setImgSrc(`http://localhost:5454/images/${fallbackPhoto}`);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      p={2}
      border="1px solid #ccc"
      borderRadius={2}
      mb={2}
    >
      <Box display="flex" flexDirection="row" alignItems="center">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={item.product?.title || "Product"}
            style={{ 
              width: '5rem', 
              height: '5rem', 
              objectFit: 'cover', 
              objectPosition: 'top',
              borderRadius: '4px'
            }}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        <Box ml={2}>
          <Typography variant="h6">{item.product?.title || "Product"}</Typography>
          <Typography variant="body2" color="text.secondary">
            <span>Color: {item.product?.color?.[0]?.name || "N/A"}</span> <span>Size: {item.size}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seller: {item.product?.brand || "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quantity: {item.quantity}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price: ₹{item.price?.toLocaleString()}
          </Typography>
          {item.discountedPrice && item.discountedPrice < item.price && (
            <Typography variant="body2" color="success.main">
              Discounted Price: ₹{item.discountedPrice?.toLocaleString()}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
});

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const order = useSelector((store) => store.order?.order);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const paymentDetails = location.state;
        if (!paymentDetails) {
          setError("Payment details not found");
          setIsLoading(false);
          return;
        }

        // Clear the cart first
        dispatch(clearCart());

        // Update payment status
        await dispatch(updatePaymentStatus({
          orderId,
          paymentId: paymentDetails.paymentId,
          razorpayOrderId: paymentDetails.razorpay_order_id
        }));

        // Fetch updated order details
        await dispatch(getOrderById(orderId));

        setIsLoading(false);
        toast.success("Order placed successfully!");
      } catch (error) {
        console.error("Error updating payment status:", error);
        setError(error.response?.data?.message || "Failed to update payment status");
        setIsLoading(false);
      }
    };

    if (orderId) {
      updateStatus();
    } else {
      setError("Order ID not found");
      setIsLoading(false);
    }
  }, [orderId, location.state, dispatch]);

  const orderItems = useMemo(() => order?.orderItems || [], [order?.orderItems]);

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" p={3}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Updating your order status...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" p={3}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
          Your payment was successful, but there was an issue updating the order status.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/account/order')}
          sx={{ mt: 2 }}
        >
          View Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" p={3}>
      <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
        Thank you for your purchase. Your order has been confirmed.
      </Typography>

      {/* Add Shipping Address Section */}
      {order?.shippingAddress && (
        <Box mt={3} width="100%" maxWidth={600} p={2} border={1} borderColor="divider" borderRadius={1}>
          <Typography variant="h6" gutterBottom>
            Shipping Address
          </Typography>
          <Suspense fallback={<CircularProgress size={20} />}>
            <AddressCard address={order.shippingAddress} />
          </Suspense>
        </Box>
      )}
      
      {/* Order Items Section */}
      <Box mt={4} width="100%" maxWidth={600}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        {orderItems.map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}
      </Box>

      {/* Existing Buttons */}
      <Box mt={4} display="flex" gap={2}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/account/order')}
          sx={{ minWidth: 150 }}
        >
          View Orders
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          sx={{ minWidth: 150 }}
        >
          Continue Shopping
        </Button>
      </Box>

      <Suspense fallback={<CircularProgress size={20} />}>
        <OrderTraker activeStep={1}/>
      </Suspense>
    </Box>
  );
};

export default PaymentSuccess;
