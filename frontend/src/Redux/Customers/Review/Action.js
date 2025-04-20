import {
    CREATE_REVIEW_SUCCESS,
    CREATE_REVIEW_FAILURE,
    GET_ALL_REVIEWS_SUCCESS,
    GET_ALL_REVIEWS_FAILURE,
    CREATE_RATING_SUCCESS,
    CREATE_RATING_FAILURE,
    GET_ALL_RATINGS_SUCCESS,
    GET_ALL_RATINGS_FAILURE
  } from './ActionTyp';
import api from '../../../config/api';

export const GET_ALL_REVIEWS_REQUEST = "GET_ALL_REVIEWS_REQUEST";
export const CREATE_REVIEW_REQUEST = "CREATE_REVIEW_REQUEST";

export const createReview = (reviewData, jwt) => {
  console.log("create review req ", reviewData);
  return async (dispatch) => {
    try {
      const response = await api.post('/api/reviews/create', 
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          }
        }
      );

      dispatch({
        type: CREATE_REVIEW_SUCCESS,
        payload: response.data
      });
      console.log("create review ", response.data);
      return response.data;
    } catch (error) {
      dispatch({
        type: CREATE_REVIEW_FAILURE,
        payload: error.response?.data?.error || error.message
      });
      throw error;
    }
  };
};

export const getAllReviews = (productId) => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_REVIEWS_REQUEST });
    const { data } = await api.get(`/api/reviews/product/${productId}`);
    dispatch({ type: GET_ALL_REVIEWS_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    dispatch({ 
      type: GET_ALL_REVIEWS_FAILURE, 
      payload: error.response?.data?.message || error.message 
    });
    // Return empty array instead of throwing error
    return [];
  }
};

export const createRating = (resData) => {
  return async (dispatch) => {
    try {
      const response = await api.post('/api/ratings/create', 
        resData);

      dispatch({
        type: CREATE_RATING_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: CREATE_RATING_FAILURE,
        payload: error.message
      });
    }
  };
};

export const getAllRatings = (productId) => {
  // console.log("product id review ",productId)
  return async (dispatch) => {
    try {
      const response = await api.get(`/api/ratings/product/${productId}`, {
       
      });

      dispatch({
        type: GET_ALL_RATINGS_SUCCESS,
        payload: response.data
      });
      console.log("all rating ",response.data)
    } catch (error) {
      dispatch({
        type: GET_ALL_RATINGS_FAILURE,
        payload: error.message
      });
    }
  };
};
