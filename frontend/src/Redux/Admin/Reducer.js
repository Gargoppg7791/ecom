import {
  GET_DASHBOARD_STATS_REQUEST,
  GET_DASHBOARD_STATS_SUCCESS,
  GET_DASHBOARD_STATS_FAILURE,
  GET_RECENT_ORDERS_REQUEST,
  GET_RECENT_ORDERS_SUCCESS,
  GET_RECENT_ORDERS_FAILURE,
  GET_SALES_OVER_TIME_REQUEST,
  GET_SALES_OVER_TIME_SUCCESS,
  GET_SALES_OVER_TIME_FAILURE
} from './ActionType';

const initialState = {
  dashboardStats: null,
  recentOrders: [],
  salesOverTime: [],
  loading: false,
  error: null
};

export const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_DASHBOARD_STATS_REQUEST:
    case GET_RECENT_ORDERS_REQUEST:
    case GET_SALES_OVER_TIME_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_DASHBOARD_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        dashboardStats: action.payload,
        error: null
      };

    case GET_RECENT_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        recentOrders: action.payload,
        error: null
      };

    case GET_SALES_OVER_TIME_SUCCESS:
      return {
        ...state,
        loading: false,
        salesOverTime: action.payload,
        error: null
      };

    case GET_DASHBOARD_STATS_FAILURE:
    case GET_RECENT_ORDERS_FAILURE:
    case GET_SALES_OVER_TIME_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
}; 