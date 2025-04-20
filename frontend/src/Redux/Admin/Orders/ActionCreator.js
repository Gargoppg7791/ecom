import {
  GET_ORDERS_REQUEST,
  GET_ORDERS_SUCCESS,
  GET_ORDERS_FAILURE,
  UPDATE_ORDER_STATUS_REQUEST,
  UPDATE_ORDER_STATUS_SUCCESS,
  UPDATE_ORDER_STATUS_FAILURE,
  DELETE_ORDER_REQUEST,
  DELETE_ORDER_SUCCESS,
  DELETE_ORDER_FAILURE,
} from "./ActionType";

// Get Orders Actions
export const getOrdersRequest = () => ({
  type: GET_ORDERS_REQUEST,
});

export const getOrdersSuccess = (data) => ({
  type: GET_ORDERS_SUCCESS,
  payload: data,
});

export const getOrdersFailure = (error) => ({
  type: GET_ORDERS_FAILURE,
  payload: error,
});

// Update Order Status Actions
export const updateOrderStatusRequest = () => ({
  type: UPDATE_ORDER_STATUS_REQUEST,
});

export const updateOrderStatusSuccess = (data) => ({
  type: UPDATE_ORDER_STATUS_SUCCESS,
  payload: data,
});

export const updateOrderStatusFailure = (error) => ({
  type: UPDATE_ORDER_STATUS_FAILURE,
  payload: error,
});

// Delete Order Actions
export const deleteOrderRequest = () => ({
  type: DELETE_ORDER_REQUEST,
});

export const deleteOrderSuccess = (orderId) => ({
  type: DELETE_ORDER_SUCCESS,
  payload: orderId,
});

export const deleteOrderFailure = (error) => ({
  type: DELETE_ORDER_FAILURE,
  payload: error,
});