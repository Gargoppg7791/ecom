import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import api from "../../../config/api";
import {
    CREATE_PAYMENT_REQUEST,
    CREATE_PAYMENT_SUCCESS,
    CREATE_PAYMENT_FAILURE,
    UPDATE_PAYMENT_REQUEST,
    UPDATE_PAYMENT_SUCCESS,
    UPDATE_PAYMENT_FAILURE,
  } from './ActionType';
  
  export const createPayment = createAsyncThunk(
    "payment/createPayment",
    async ({ orderId, jwt }, { rejectWithValue }) => {
      try {
        console.log("Creating payment for order:", orderId);
        const response = await api.post(
          `/api/payments/${orderId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        console.log("Payment order created:", response.data);

        // Initialize Razorpay checkout
        const options = {
          key: response.data.data.key,
          amount: response.data.data.amount,
          currency: response.data.data.currency,
          name: "Your Store Name",
          description: "Order Payment",
          order_id: response.data.data.orderId,
          handler: async function (response) {
            try {
              // Verify payment
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
                toast.success("Payment successful!");
                // Redirect to order confirmation page
                window.location.href = `/order-confirmation/${orderId}`;
              } else {
                toast.error("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              toast.error(error.response?.data?.message || "Payment verification failed");
            }
          },
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();

        razorpay.on("payment.failed", function (response) {
          console.error("Payment failed:", response.error);
          toast.error(response.error.description || "Payment failed");
        });

        return response.data;
      } catch (error) {
        console.error("Payment creation error:", error);
        toast.error(error.response?.data?.message || "Failed to create payment");
        return rejectWithValue(error.response?.data || "Failed to create payment");
      }
    }
  );
  
  export const updatePayment = (reqData) => {
    return async (dispatch) => {
      console.log("update payment reqData ", reqData);
      dispatch(updatePaymentRequest());
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${reqData.jwt}`,
          },
        };
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payments?payment_id=${reqData.paymentId}&order_id=${reqData.orderId}`,
          config
        );
        console.log("updated data ---- ", response.data);
        dispatch(updatePaymentSuccess(response.data));
      } catch (error) {
        console.error("Payment update error:", error);
        dispatch(updatePaymentFailure(error.response?.data?.message || error.message));
        throw error; // Re-throw to handle in the component
      }
    };
  };

export const updatePaymentRequest = () => {
  return {
    type: UPDATE_PAYMENT_REQUEST,
  };
};

export const updatePaymentSuccess = (payment) => {
  return {
    type: UPDATE_PAYMENT_SUCCESS,
    payload: payment,
  };
};

export const updatePaymentFailure = (error) => {
  return {
    type: UPDATE_PAYMENT_FAILURE,
    payload: error,
  };
};

 
  