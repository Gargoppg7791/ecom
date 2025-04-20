import axios from "axios";
import {
  CREATE_ORDER_FAILURE,
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  GET_ORDER_BY_ID_FAILURE,
  GET_ORDER_BY_ID_REQUEST,
  GET_ORDER_BY_ID_SUCCESS,
  GET_ORDER_HISTORY_FAILURE,
  GET_ORDER_HISTORY_REQUEST,
  GET_ORDER_HISTORY_SUCCESS,
  UPDATE_PAYMENT_STATUS_REQUEST,
  UPDATE_PAYMENT_STATUS_SUCCESS,
  UPDATE_PAYMENT_STATUS_FAILURE,
} from "./ActionType";
import api, { API_BASE_URL, updateAuthToken } from "../../../config/api";

export const createOrder = (reqData) => async (dispatch) => {
  console.log("req data ", reqData);
  try {
    dispatch({ type: CREATE_ORDER_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqData.jwt}`,
      },
    };

    const { data } = await api.post(
      `${API_BASE_URL}/api/orders/`,
      reqData.address,
      config
    );
    
    console.log("created order - ", data);
    
    if (data.id) {
      reqData.navigate(`/checkout?step=3&order_id=${data.id}`);
    }
    
    dispatch({
      type: CREATE_ORDER_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    console.log("catch error : ", error);
    dispatch({
      type: CREATE_ORDER_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    throw error;
  }
};

export const getOrderById = (orderId) => async (dispatch) => {
  console.log("getOrderById called with orderId:", orderId);
  try {
    dispatch({ type: GET_ORDER_BY_ID_REQUEST });

    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      throw new Error("No authentication token found");
    }

    // Update the auth token
    updateAuthToken(jwt);

    console.log("Making API request to get order:", orderId);
    const { data } = await api.get(`/api/orders/${orderId}`);
    console.log("API response:", data);

    if (!data) {
      throw new Error("No order data received from server");
    }

    dispatch({
      type: GET_ORDER_BY_ID_SUCCESS,
      payload: data,
    });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    dispatch({
      type: GET_ORDER_BY_ID_FAILURE,
      payload:
        error.response?.data?.message || error.message || "Failed to fetch order",
    });
  }
};

export const getOrderHistory = (reqData) => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_ORDER_HISTORY_REQUEST });

    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      throw new Error("No authentication token found");
    }

    // Update the auth token
    updateAuthToken(jwt);

    const { data } = await api.get(`/api/orders/user`);
    console.log("order history -------- ", data);
    
    dispatch({
      type: GET_ORDER_HISTORY_SUCCESS,
      payload: data.data
    });
  } catch (error) {
    dispatch({
      type: GET_ORDER_HISTORY_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updatePaymentStatus = (reqData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PAYMENT_STATUS_REQUEST });

    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      throw new Error("No authentication token found");
    }

    // Update the auth token
    updateAuthToken(jwt);

    // Update the payment status
    const { data } = await api.put(
      `/api/orders/${reqData.orderId}/payment`,
      {
        paymentId: reqData.paymentId,
        razorpayOrderId: reqData.razorpayOrderId,
      }
    );

    dispatch({
      type: UPDATE_PAYMENT_STATUS_SUCCESS,
      payload: data,
    });

    // Fetch updated order details
    dispatch(getOrderById(reqData.orderId));

    return data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    dispatch({
      type: UPDATE_PAYMENT_STATUS_FAILURE,
      payload: error.response?.data?.message || error.message || "Failed to update payment status",
    });
    throw error;
  }
};
