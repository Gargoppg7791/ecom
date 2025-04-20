import api from '../../config/api';
import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_READ_REQUEST,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_NOTIFICATION_READ_FAILURE,
} from './ActionType';

export const getNotifications = () => async (dispatch) => {
  dispatch({ type: GET_NOTIFICATIONS_REQUEST });
  
  try {
    const response = await api.get('/api/notifications');
    dispatch({
      type: GET_NOTIFICATIONS_SUCCESS,
      payload: response.data.data || [],
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    dispatch({
      type: GET_NOTIFICATIONS_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch notifications',
    });
  }
};

export const markNotificationAsRead = (notificationIds) => async (dispatch) => {
  dispatch({ type: MARK_NOTIFICATION_READ_REQUEST });
  
  try {
    const response = await api.put('/api/notifications/read', { notificationIds });
    dispatch({
      type: MARK_NOTIFICATION_READ_SUCCESS,
      payload: response.data.data || [],
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    dispatch({
      type: MARK_NOTIFICATION_READ_FAILURE,
      payload: error.response?.data?.message || 'Failed to mark notifications as read',
    });
  }
}; 