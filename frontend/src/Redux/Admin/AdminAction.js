import {
  GET_DASHBOARD_STATS_REQUEST,
  GET_DASHBOARD_STATS_SUCCESS,
  GET_DASHBOARD_STATS_FAILURE,
//   GET_RECENT_ORDERS_REQUEST,
//   GET_RECENT_ORDERS_SUCCESS,
//   GET_RECENT_ORDERS_FAILURE,
  GET_SALES_OVER_TIME_REQUEST,
  GET_SALES_OVER_TIME_SUCCESS,
  GET_SALES_OVER_TIME_FAILURE
} from './ActionType';
import api from '../../config/api';

export const getDashboardStats = () => async (dispatch) => {
  try {
    dispatch({ type: GET_DASHBOARD_STATS_REQUEST });
    const jwt = localStorage.getItem('jwt');
    const response = await api.get('/api/admin/dashboard-stats', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    dispatch({
      type: GET_DASHBOARD_STATS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_DASHBOARD_STATS_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch dashboard stats',
    });
  }
};

// // export const getRecentOrders = () => async (dispatch) => {
//   try {
//     dispatch({ type: GET_RECENT_ORDERS_REQUEST });
//     const jwt = localStorage.getItem('jwt');
//     const response = await api.get('/api/admin/recent-orders', {
//       headers: {
//         Authorization: `Bearer ${jwt}`,
//       },
//     });
//     dispatch({
//       type: GET_RECENT_ORDERS_SUCCESS,
//       payload: response.data,
//     });
//   } catch (error) {
//     dispatch({
//       type: GET_RECENT_ORDERS_FAILURE,
//       payload: error.response?.data?.message || 'Failed to fetch recent orders',
//     });
//   }
// };

export const getSalesOverTime = () => async (dispatch) => {
  try {
    dispatch({ type: GET_SALES_OVER_TIME_REQUEST });
    const jwt = localStorage.getItem('jwt');
    console.log('Fetching sales over time data...');
    
    const response = await api.get('/api/admin/sales-over-time', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    
    console.log('Sales over time response:', response.data);
    
    if (!response.data || !response.data.weeklyData) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format from sales over time API');
    }
    
    dispatch({
      type: GET_SALES_OVER_TIME_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    console.error('Error fetching sales over time:', error);
    dispatch({
      type: GET_SALES_OVER_TIME_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch sales data',
    });
  }
}; 