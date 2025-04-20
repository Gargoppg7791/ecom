import {
  GET_RECENT_PRODUCTS_REQUEST,
  GET_RECENT_PRODUCTS_SUCCESS,
  GET_RECENT_PRODUCTS_FAILURE,
} from './Action';

const initialState = {
  recentProducts: [],
  loading: false,
  error: null,
};

export const recentProductsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_RECENT_PRODUCTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_RECENT_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        recentProducts: action.payload,
        error: null,
      };
    case GET_RECENT_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}; 