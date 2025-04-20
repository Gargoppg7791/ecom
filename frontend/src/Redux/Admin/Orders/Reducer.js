import {
  CANCELED_ORDER_FAILURE,
  CANCELED_ORDER_REQUEST,
  CANCELED_ORDER_SUCCESS,
  CONFIRMED_ORDER_FAILURE,
  CONFIRMED_ORDER_REQUEST,
  CONFIRMED_ORDER_SUCCESS,
  DELETE_ORDER_FAILURE,
  DELETE_ORDER_REQUEST,
  DELETE_ORDER_SUCCESS,
  DELIVERED_ORDER_FAILURE,
  DELIVERED_ORDER_REQUEST,
  DELIVERED_ORDER_SUCCESS,
  GET_ORDERS_FAILURE,
  GET_ORDERS_REQUEST,
  GET_ORDERS_SUCCESS,
  PLACED_ORDER_FAILURE,
  PLACED_ORDER_REQUEST,
  PLACED_ORDER_SUCCESS,
  SHIP_ORDER_FAILURE,
  SHIP_ORDER_REQUEST,
  SHIP_ORDER_SUCCESS,
  UPDATE_ORDER_STATUS_REQUEST,
  UPDATE_ORDER_STATUS_SUCCESS,
  UPDATE_ORDER_STATUS_FAILURE,
} from "./ActionType";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  totalOrders: 0,
};

const adminOrderReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ORDERS_REQUEST:
    case UPDATE_ORDER_STATUS_REQUEST:
    case DELETE_ORDER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: action.payload.orders || [],
        totalOrders: action.payload.totalOrders || 0,
        error: null,
      };

    case GET_ORDERS_FAILURE:
    case UPDATE_ORDER_STATUS_FAILURE:
    case DELETE_ORDER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_ORDER_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order
        ),
        error: null,
      };

    case DELETE_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: state.orders.filter((order) => order.id !== action.payload),
        error: null,
      };

    case CONFIRMED_ORDER_REQUEST:
    case PLACED_ORDER_REQUEST:
    case DELIVERED_ORDER_REQUEST:
    case CANCELED_ORDER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case CONFIRMED_ORDER_SUCCESS:
      return {
        ...state,
        confirmed: action.payload,
        isLoading: false,
      };
    case PLACED_ORDER_SUCCESS:
      return {
        ...state,
        placed: action.payload,
        isLoading: false,
      };
    case DELIVERED_ORDER_SUCCESS:
      return {
        ...state,
        delivered: action.payload,
        isLoading: false,
      };
    case CANCELED_ORDER_SUCCESS:
      return {
        ...state,
        canceled: action.payload,
        isLoading: false,
      };

    case CONFIRMED_ORDER_FAILURE:
    case PLACED_ORDER_FAILURE:
    case DELIVERED_ORDER_FAILURE:
    case CANCELED_ORDER_FAILURE:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case SHIP_ORDER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case SHIP_ORDER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        shipped:action.payload
      };
    case SHIP_ORDER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default adminOrderReducer;
