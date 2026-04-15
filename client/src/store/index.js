import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
  },
});

export default store;
