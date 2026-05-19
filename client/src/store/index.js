import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    products: productReducer,
    cart: cartReducer,
    admin: adminReducer,
  },
});

export default store;
