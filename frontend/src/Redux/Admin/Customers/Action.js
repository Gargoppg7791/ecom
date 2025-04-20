import api from "../../../config/api";
import {
  GET_CUSTOMERS_REQUEST,
  GET_CUSTOMERS_SUCCESS,
  GET_CUSTOMERS_FAILURE,
  UPDATE_CUSTOMER_ROLE_REQUEST,
  UPDATE_CUSTOMER_ROLE_SUCCESS,
  UPDATE_CUSTOMER_ROLE_FAILURE
} from "./ActionType";

import axios from 'axios';

export const updateCustomerRole = (customerId, newRole) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_CUSTOMER_ROLE_REQUEST });
    
    const response = await axios.put(`${API_BASE_URL}/api/admin/users/${customerId}/role`, 
      { role: newRole },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    dispatch({
      type: UPDATE_CUSTOMER_ROLE_SUCCESS,
      payload: { customerId, newRole }
    });

    // Refresh the customers list
    dispatch(getCustomers());
    
  } catch (error) {
    dispatch({
      type: UPDATE_CUSTOMER_ROLE_FAILURE,
      payload: error.message
    });
  }
};

export const getCustomersRequest = () => ({
  type: GET_CUSTOMERS_REQUEST,
});

export const getCustomersSuccess = (customers) => ({
  type: GET_CUSTOMERS_SUCCESS,
  payload: customers,
});

export const getCustomersFailure = (error) => ({
  type: GET_CUSTOMERS_FAILURE,
  payload: error,
});

export const getCustomers = () => {
  return async (dispatch) => {
    dispatch(getCustomersRequest());
    try {
      const response = await api.get(`/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      dispatch(getCustomersSuccess(response.data));
    } catch (error) {
      dispatch(getCustomersFailure(error.message));
    }
  };
};