import { combineReducers } from 'redux';
import { authReducer } from './Auth/Reducer';
import { cartReducer } from './Cart/Reducer';
import { orderReducer } from './Order/Reducer';
import { productReducer } from './Product/Reducer';
import { adminReducer } from './Admin/AdminReducer';
import { notificationReducer } from './Notification/Reducer';
import themeReducer from './Theme/Reducer';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  order: orderReducer,
  product: productReducer,
  admin: adminReducer,
  notification: notificationReducer,
  theme: themeReducer,
});

export default rootReducer; 