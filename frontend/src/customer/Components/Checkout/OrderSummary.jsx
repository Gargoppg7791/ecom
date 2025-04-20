import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById } from "../../../Redux/Customers/Order/Action";
import { createPayment } from "../../../Redux/Customers/Payment/Action";
import { toast } from "react-hot-toast";
import api from "../../../config/api";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import CartItem from "../Cart/CartItem";
import AddressCard from "../adreess/AdreessCard";
import { useNavigate } from "react-router-dom";
import EMIOptions from './EMIOptions';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Remove any existing Razorpay script
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const OrderSummary = ({ orderId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading, error: orderError } = useSelector((store) => store.order);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEMI, setSelectedEMI] = useState(null);
  const razorpayInstanceRef = React.useRef(null);

  // Cleanup function for Razorpay elements
  const cleanupRazorpay = React.useCallback(() => {
    try {
      // Remove any existing Razorpay elements
      const elements = document.querySelectorAll(
        '.razorpay-container, .razorpay-frame, .razorpay-outer-container, .razorpay-backdrop, .razorpay-loader'
      );
      elements.forEach(el => el.remove());

      // Clear the Razorpay instance
      if (razorpayInstanceRef.current) {
        razorpayInstanceRef.current = null;
      }

      // Remove any leftover styles
      const styles = document.querySelectorAll('style[id*="razorpay"]');
      styles.forEach(style => style.remove());

      // Reset body styles that might have been modified
      document.body.style.overflow = '';
      document.body.style.position = '';
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupRazorpay();
    };
  }, [cleanupRazorpay]);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [orderId, dispatch]);

  const handleCreatePayment = async () => {
    try {
      setError(null);
      setIsPaymentLoading(true);
      const jwt = localStorage.getItem("jwt");
      
      if (!jwt) {
        setError("Please login to continue with payment");
        return;
      }

      if (!orderId) {
        setError("Order ID is missing");
        return;
      }

      // Cleanup any existing Razorpay elements before creating new ones
      cleanupRazorpay();

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError("Failed to load payment gateway. Please try again.");
        return;
      }

      const response = await dispatch(createPayment({ orderId, jwt })).unwrap();

      if (!response.success || !response.data) {
        throw new Error("Failed to create payment order");
      }

      const options = {
        key: response.data.key,
        amount: response.data.amount,
        currency: response.data.currency,
        name: "E-Commerce Store",
        description: selectedEMI ? `EMI Payment - ${selectedEMI.tenure} months` : "Order Payment",
        order_id: response.data.orderId,
        prefill: {
          name: order?.user?.firstName || "Customer",
          email: order?.user?.email || "",
          contact: order?.user?.mobile || "",
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: "EMI Available",
                instruments: [
                  {
                    method: "emi",
                    banks: ["HDFC", "ICICI", "AXIS"]
                  }
                ]
              }
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        handler: async function (response) {
          try {
            const verifyResponse = await api.get(
              `/api/payments/verify`,
              {
                params: {
                  payment_id: response.razorpay_payment_id,
                  order_id: orderId,
                  razorpay_order_id: response.razorpay_order_id,
                },
                headers: {
                  Authorization: `Bearer ${jwt}`,
                },
              }
            );

            if (verifyResponse.data.success) {
              cleanupRazorpay();
              setIsPaymentLoading(false);
              toast.success("Payment successful! Your order has been placed.");
              navigate(`/payment-success/${orderId}`, { 
                replace: true,
                state: { 
                  paymentId: response.razorpay_payment_id,
                  orderId: orderId,
                  razorpay_order_id: response.razorpay_order_id
                }
              });
            } else {
              setError("Payment verification failed");
              cleanupRazorpay();
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setError(error.response?.data?.message || "Payment verification failed");
            cleanupRazorpay();
          } finally {
            setIsPaymentLoading(false);
          }
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function() {
            setIsPaymentLoading(false);
            setError(null);
            cleanupRazorpay();
            // Re-enable scrolling
            document.body.style.overflow = '';
          },
          escape: true,
          animation: true,
          backdropClose: true,
          handleback: true
        },
        retry: {
          enabled: false
        }
      };

      // Add EMI options if selected
      if (selectedEMI) {
        options.config.display.blocks.banks.instruments = [{
          method: "emi",
          banks: [selectedEMI.bank]
        }];
      }

      const razorpay = new window.Razorpay(options);
      razorpayInstanceRef.current = razorpay;

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setError(response.error.description || "Payment failed");
        cleanupRazorpay();
        setIsPaymentLoading(false);
      });

      razorpay.on("modal.closed", function() {
        setIsPaymentLoading(false);
        setError(null);
        cleanupRazorpay();
        // Re-enable scrolling
        document.body.style.overflow = '';
      });

      // Enable scrolling when modal opens
      document.body.style.overflow = 'auto';
      razorpay.open();

    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "Failed to initiate payment");
      cleanupRazorpay();
    } finally {
      setIsPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (orderError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {orderError}
      </Alert>
    );
  }

  if (!order) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Order not found. Please check your order ID and try again.
      </Alert>
    );
  }

  console.log("Rendering order summary with order:", order);

  return (
    <div className="space-y-5">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      <div className="p-5 shadow-lg rounded-md border">
        <AddressCard address={order.shippingAddress} />
      </div>
      <div className="lg:grid grid-cols-3 relative">
        <div className="lg:col-span-2">
          <div className="space-y-3">
            {order.orderItems?.map((item) => (
              <CartItem key={item.id} item={item} showButton={false} />
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-8 mt-5 lg:mt-0 lg:ml-5">
          <div className="border p-5 bg-white shadow-lg rounded-md">
            <p className="font-bold opacity-60 pb-4">PRICE DETAILS</p>
            <hr />

            <div className="space-y-3 font-semibold">
              <div className="flex justify-between pt-3 text-black">
                <span>Price ({order.totalItem} item)</span>
                <span>₹{(order.totalPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-green-700">-₹{(order.discount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-green-700">Free</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-green-700">₹{(order.totalDiscountedPrice).toLocaleString()}</span>
              </div>
            </div>

            {order?.totalDiscountedPrice >= 3000 && (
              <div className="mt-4">
                <EMIOptions
                  amount={order.totalDiscountedPrice}
                  onEMISelect={(emiOption) => setSelectedEMI(emiOption)}
                />
              </div>
            )}

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleCreatePayment}
              disabled={isPaymentLoading}
              fullWidth
            >
              {isPaymentLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `Pay ${selectedEMI ? '(EMI)' : ''} ₹${order.totalDiscountedPrice}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
