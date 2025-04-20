import api from "../../../config/api";
import {
  getOrdersRequest,
  getOrdersSuccess,
  getOrdersFailure,
  updateOrderStatusRequest,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  deleteOrderRequest,
  deleteOrderSuccess,
  deleteOrderFailure,
} from "./ActionCreator";
import { toast } from "react-hot-toast";

/**
 * Get all orders
 * @param {Object} params - Query parameters
 * @returns {Function} - Redux thunk
 */
export const getOrders = ({ jwt, page = 0, status, sort }) => {
  return async (dispatch) => {
    try {
      dispatch(getOrdersRequest());
      let url = `/api/admin/orders?page=${page}`;
      
      if (status) {
        url += `&status=${status}`;
      }
      if (sort) {
        url += `&sort=${sort}`;
      }

      console.log("Fetching orders from URL:", url); // Debug log
      console.log("JWT token:", jwt ? "Present" : "Missing"); // Debug log

      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      console.log("Full API Response:", response); // Debug log
      
      if (!response.data) {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format from server");
      }

      // Handle both array and object response formats
      const orders = Array.isArray(response.data) ? response.data : response.data.orders || [];
      const totalOrders = response.data.totalOrders || orders.length;

      dispatch(getOrdersSuccess({
        orders,
        totalOrders
      }));
    } catch (error) {
      console.error("Error in getOrders:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      dispatch(getOrdersFailure(error.message));
    }
  };
};

export const updateOrderStatus = (orderId, status) => {
  return async (dispatch) => {
    try {
      dispatch(updateOrderStatusRequest());
      const jwt = localStorage.getItem('jwt');
      
      // Map the status to the correct endpoint and base URL
      const statusMap = {
        'placed': {
          baseUrl: '/api/orders',
          endpoint: 'payment'
        },
        'confirmed': {
          baseUrl: '/api/admin/orders',
          endpoint: 'confirmed'
        },
        'ship': {
          baseUrl: '/api/admin/orders',
          endpoint: 'ship'
        },
        'deliver': {
          baseUrl: '/api/admin/orders',
          endpoint: 'deliver'
        },
        'cancel': {
          baseUrl: '/api/admin/orders',
          endpoint: 'cancel'
        }
      };

      const route = statusMap[status.toLowerCase()];
      if (!route) {
        throw new Error('Invalid order status');
      }

      console.log(`Updating order ${orderId} to status: ${route.endpoint}`);

      // Use the correct endpoint based on the status
      const response = await api.put(
        `${route.baseUrl}/${orderId}/${route.endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Update response:', response.data);
      dispatch(updateOrderStatusSuccess(response.data));
      toast.success(`Order status updated to ${route.endpoint.toUpperCase()}`);
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      dispatch(updateOrderStatusFailure(error.message));
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };
};

export const deleteOrder = (orderId) => {
  return async (dispatch) => {
    try {
      dispatch(deleteOrderRequest());
      await api.delete(`/api/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      dispatch(deleteOrderSuccess(orderId));
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error("Error in deleteOrder:", error);
      dispatch(deleteOrderFailure(error.message));
      toast.error(error.message || 'Failed to delete order');
    }
  };
};