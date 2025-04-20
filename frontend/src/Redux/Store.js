import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import { combineReducers } from 'redux';
import authReducer from "./Auth/Reducer";
import customerProductReducer from "./Customers/Product/Reducer";
import productReducer from "./Admin/Product/Reducer";
import cartReducer from "./Customers/Cart/Reducer";
import { orderReducer } from "./Customers/Order/Reducer";
import adminOrderReducer from "./Admin/Orders/Reducer";
import ReviewReducer from "./Customers/Review/Reducer";
import customerReducer from "./Admin/Customers/Reducer";
import categoryReducer from "./Customers/Category/Reducer";
import { recentProductsReducer } from './Admin/Products/Reducer';
import notificationReducer from './Notification/Reducer';
import { adminReducer } from './Admin/Reducer';

// Load user data from localStorage
const loadUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error("Error loading user data:", error);
    return null;
  }
};

const rootReducers = combineReducers({
  auth: authReducer,
  customersProduct: customerProductReducer,
  cart: cartReducer,
  order: orderReducer,
  review: ReviewReducer,
  category: categoryReducer,
  notification: notificationReducer,

  // admin
  adminsProduct: productReducer,
  adminsOrder: adminOrderReducer,
  adminCustomers: customerReducer,
  recentProducts: recentProductsReducer,
  admin: adminReducer,
});

const store = configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  preloadedState: {
    auth: {
      user: loadUserData(),
      isLoading: false,
      error: null,
      message: null
    }
  }
});

export default store;