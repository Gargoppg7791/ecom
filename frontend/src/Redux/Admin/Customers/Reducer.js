import {
  GET_CUSTOMERS_REQUEST,
  GET_CUSTOMERS_SUCCESS,
  GET_CUSTOMERS_FAILURE,
  UPDATE_CUSTOMER_ROLE_REQUEST,
  UPDATE_CUSTOMER_ROLE_SUCCESS,
  UPDATE_CUSTOMER_ROLE_FAILURE
} from "./ActionType";

const initialState = {
  customers: [],
  loading: false,
  error: null,
  roleUpdateLoading: false,
  roleUpdateError: null
};

const customerReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CUSTOMERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_CUSTOMERS_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: action.payload,
      };
    case GET_CUSTOMERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
      case UPDATE_CUSTOMER_ROLE_REQUEST:
        return {
          ...state,
          roleUpdateLoading: true,
          roleUpdateError: null
        };
        
      case UPDATE_CUSTOMER_ROLE_SUCCESS:
        return {
          ...state,
          roleUpdateLoading: false,
          customers: state.customers.map(customer =>
            customer.id === action.payload.customerId
              ? { ...customer, role: action.payload.newRole }
              : customer
          )
        };
        
      case UPDATE_CUSTOMER_ROLE_FAILURE:
        return {
          ...state,
          roleUpdateLoading: false,
          roleUpdateError: action.payload
        };
    default:
      return state;
  }
};

export default customerReducer;