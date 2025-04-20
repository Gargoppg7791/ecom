import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_READ_REQUEST,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_NOTIFICATION_READ_FAILURE,
} from './ActionType';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload,
        unreadCount: action.payload.filter(notification => !notification.read).length,
        error: null,
      };
    case GET_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case MARK_NOTIFICATION_READ_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case MARK_NOTIFICATION_READ_SUCCESS:
      const updatedNotifications = state.notifications.map(notification =>
        action.payload.includes(notification.id)
          ? { ...notification, read: true }
          : notification
      );
      return {
        ...state,
        loading: false,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(notification => !notification.read).length,
        error: null,
      };
    case MARK_NOTIFICATION_READ_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default notificationReducer; 