import axios from "axios";


import { API_BASE_URL } from "../../../config/api";
import {
    ADD_ITEM_TO_CART_REQUEST,
    ADD_ITEM_TO_CART_SUCCESS,
    ADD_ITEM_TO_CART_FAILURE,
  GET_CART_FAILURE,
  GET_CART_REQUEST,
  GET_CART_SUCCESS,
  REMOVE_CART_ITEM_FAILURE,
  REMOVE_CART_ITEM_REQUEST,
  REMOVE_CART_ITEM_SUCCESS,
  UPDATE_CART_ITEM_FAILURE,
  UPDATE_CART_ITEM_REQUEST,
  UPDATE_CART_ITEM_SUCCESS,
  CLEAR_CART_SUCCESS,
} from "./ActionType";

export const addItemToCart = (reqData) => async (dispatch) => {
    console.log("req data ",reqData)
  try {
   
    dispatch({ type: ADD_ITEM_TO_CART_REQUEST });
    const config = {
      headers: {
        Authorization: `Bearer ${reqData.jwt}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.put(`${API_BASE_URL}/api/cart/add`, 
      reqData.data,
      config,
    );
console.log("add item to cart ",data)
    dispatch({
      type: ADD_ITEM_TO_CART_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ADD_ITEM_TO_CART_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
export const getCart = (jwt) => async (dispatch) => {
  try {
    dispatch({ type: GET_CART_REQUEST });
    const config = {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type":"application/json"
        },
      };
    const { data } = await axios.get(`${API_BASE_URL}/api/cart/`,config);
console.log("cart ",data)
    dispatch({
      type: GET_CART_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_CART_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const removeCartItem = (reqData) => async (dispatch) => {
    try {
      dispatch({ type: REMOVE_CART_ITEM_REQUEST });
      
      if (!reqData.cartItemId || !reqData.jwt) {
        throw new Error("Missing required data for cart item removal");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${reqData.jwt}`,
          "Content-Type": "application/json"
        },
      };

      await axios.delete(
        `${API_BASE_URL}/api/cart_items/${reqData.cartItemId}`,
        config
      );

      dispatch({
        type: REMOVE_CART_ITEM_SUCCESS,
        payload: reqData.cartItemId,
      });

      // Return success to allow proper handling in the component
      return { success: true };
    } catch (error) {
      console.error("Error removing cart item:", error);
      
      const errorMessage = error.response?.data?.message || error.message;
      dispatch({
        type: REMOVE_CART_ITEM_FAILURE,
        payload: errorMessage,
      });

      // Throw error to allow proper handling in the component
      throw new Error(errorMessage);
    }
  };
  
  export const updateCartItem = (reqData) => async (dispatch) => {
    try {
      // Validate input data
      if (!reqData) {
        throw new Error("Request data is required");
      }

      const { cartItemId, jwt, data } = reqData;
      
      // Validate required fields
      if (!cartItemId) {
        throw new Error("Cart item ID is required");
      }
      if (!jwt) {
        throw new Error("JWT token is required");
      }
      if (!data || typeof data.quantity !== 'number') {
        throw new Error("Valid quantity is required");
      }

      dispatch({ type: UPDATE_CART_ITEM_REQUEST });
      
      const config = {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
      };
      
      // Ensure cartItemId is a valid number
      const parsedCartItemId = parseInt(cartItemId);
      if (isNaN(parsedCartItemId) || parsedCartItemId <= 0) {
        throw new Error("Invalid cart item ID");
      }
      
      // Prepare update data with validated quantity
      const updateData = {
        quantity: Math.max(1, parseInt(data.quantity))
      };
      
      // Make the API request
      const response = await axios.put(
        `${API_BASE_URL}/api/cart_items/${parsedCartItemId}`,
        updateData,
        config
      );
      
      // Validate response
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      const responseData = response.data;
      
      // Update cart item state
      dispatch({
        type: UPDATE_CART_ITEM_SUCCESS,
        payload: responseData
      });
      
      // Get updated cart data
      const cartResponse = await axios.get(
        `${API_BASE_URL}/api/cart/`,
        config
      );
      
      if (cartResponse && cartResponse.data) {
        dispatch({
          type: GET_CART_SUCCESS,
          payload: cartResponse.data
        });
      }
      
      return responseData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Cart update error:", errorMessage);
      
      dispatch({
        type: UPDATE_CART_ITEM_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
  
export const clearCart = () => (dispatch) => {
  dispatch({
    type: CLEAR_CART_SUCCESS,
    payload: null,
  });
};
  