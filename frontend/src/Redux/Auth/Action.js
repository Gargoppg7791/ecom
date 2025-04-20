import axios from 'axios';
import {
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_FAILURE,
  LOGOUT,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  VERIFY_EMAIL_REQUEST,
  VERIFY_EMAIL_SUCCESS,
  VERIFY_EMAIL_FAILURE,
  ADMIN_LOGIN_REQUEST,
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGIN_FAILURE
} from './ActionTypes';
import api, { API_BASE_URL } from '../../config/api';

// Register action creators
const registerRequest = () => ({ type: REGISTER_REQUEST });
const registerSuccess = (user) => ({ type: REGISTER_SUCCESS, payload: user });
const registerFailure = error => ({ type: REGISTER_FAILURE, payload: error });

export const register = (userData) => async (dispatch) => {
  dispatch(registerRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
    dispatch(registerSuccess(response.data));
    return response.data;
  } catch (error) {
    dispatch(registerFailure(error.response?.data?.message || error.message));
    throw error;
  }
};

// Login action creators
const loginRequest = () => ({ type: LOGIN_REQUEST });
export const loginSuccess = user => ({ type: LOGIN_SUCCESS, payload: user });
const loginFailure = error => ({ type: LOGIN_FAILURE, payload: error });

export const login = (userData) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, userData);
    const { jwt, ...user } = response.data;
    
    // Store JWT and user data in localStorage
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("user", JSON.stringify(user));
    
    // Set default auth header
    api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    
    // Dispatch login success
    dispatch(loginSuccess({ ...user, jwt }));
    
    // Initialize cart after successful login
    dispatch(getCart(jwt));
    
    return { jwt, ...user };
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || error.message));
    throw error;
  }
};

// Google Sign-In action creators
const googleLoginRequest = () => ({ type: LOGIN_REQUEST });
const googleLoginSuccess = user => ({ type: LOGIN_SUCCESS, payload: user });
const googleLoginFailure = error => ({ type: LOGIN_FAILURE, payload: error });

export const googleLogin = token => async dispatch => {
  dispatch(googleLoginRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/google`, { token });
    const { jwt, ...userData } = response.data;
    
    // Store JWT and user data in localStorage
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Set default auth header
    api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    
    // Dispatch login success
    dispatch(googleLoginSuccess({ ...userData, jwt }));
    
    // Initialize cart after successful login
    dispatch(getCart(jwt));
    
    return { jwt, ...userData };
  } catch (error) {
    dispatch(googleLoginFailure(error.message));
    throw error;
  }
};

// Get user action creators
export const getUser = (jwt) => async (dispatch) => {
  dispatch({ type: GET_USER_REQUEST });
  try {
    if (!jwt) {
      throw new Error("No token provided");
    }
    const { data } = await api.get('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
    
    // Update JWT and user data in localStorage if they're different
    if (data.jwt && data.jwt !== jwt) {
      localStorage.setItem("jwt", data.jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;
    }
    localStorage.setItem("user", JSON.stringify(data));
    
    dispatch({ type: GET_USER_SUCCESS, payload: data });
  } catch (error) {
    // If there's an auth error, clear the stored data
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
    }
    dispatch({ type: GET_USER_FAILURE, payload: error.message });
  }
};

// Logout action
export const logout = () => {
  // Clear localStorage
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
  
  // Clear auth header
  delete api.defaults.headers.common["Authorization"];
  
  return { type: LOGOUT };
};

// Forgot password action creators
const forgotPasswordRequest = () => ({ type: FORGOT_PASSWORD_REQUEST });
const forgotPasswordSuccess = message => ({ type: FORGOT_PASSWORD_SUCCESS, payload: message });
const forgotPasswordFailure = error => ({ type: FORGOT_PASSWORD_FAILURE, payload: error });

export const forgotPassword = email => async dispatch => {
  dispatch(forgotPasswordRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    dispatch(forgotPasswordSuccess(response.data.message));
  } catch (error) {
    dispatch(forgotPasswordFailure(error.message));
  }
};

// Reset password action creators
const resetPasswordRequest = () => ({ type: RESET_PASSWORD_REQUEST });
const resetPasswordSuccess = (data) => ({ type: RESET_PASSWORD_SUCCESS, payload: data });
const resetPasswordFailure = error => ({ type: RESET_PASSWORD_FAILURE, payload: error });

export const resetPassword = (token, newPassword) => async dispatch => {
  dispatch(resetPasswordRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password/${token}`, { newPassword });
    dispatch(resetPasswordSuccess(response.data));
    return response.data;
  } catch (error) {
    dispatch(resetPasswordFailure(error.response?.data || error.message));
    throw error;
  }
};

// Verify email action creators
const verifyEmailRequest = () => ({ type: VERIFY_EMAIL_REQUEST });
const verifyEmailSuccess = (data) => ({ type: VERIFY_EMAIL_SUCCESS, payload: data });
const verifyEmailFailure = error => ({ type: VERIFY_EMAIL_FAILURE, payload: error });

export const verifyEmail = (token) => async (dispatch) => {
  dispatch(verifyEmailRequest());
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/verify/${token}`);
    const { jwt, ...user } = response.data;
    
    // Store JWT and user data in localStorage
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("user", JSON.stringify(user));
    
    // Set default auth header
    api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    
    // Dispatch verification success
    dispatch(verifyEmailSuccess({ ...user, jwt }));
    
    // Initialize cart after successful verification
    dispatch(getCart(jwt));
    
    return { jwt, ...user };
  } catch (error) {
    dispatch(verifyEmailFailure(error.response?.data?.message || error.message));
    throw error;
  }
};

export const updateUserProfile = (userData) => async (dispatch) => {
    try {
        const jwt = localStorage.getItem("jwt");
        const response = await api.put("/api/users/profile", userData, {
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        });
        
        // Update the user data in Redux store
        dispatch(loginSuccess(response.data));
        
        // Update localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to update profile");
    }
};

// Admin login action
export const adminLogin = (adminData) => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_LOGIN_REQUEST });
    
    const { data } = await api.post('/auth/admin/login', adminData);
    
    if (data.jwt) {
      localStorage.setItem('jwt', data.jwt);
      // Store the entire user data including role
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: ADMIN_LOGIN_SUCCESS, payload: data });
      return data;
    }
  } catch (error) {
    console.error('Admin login error:', error);
    dispatch({ type: ADMIN_LOGIN_FAILURE, payload: error.response?.data?.message || error.message });
    throw error;
  }
};