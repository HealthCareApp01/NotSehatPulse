import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { clearCartLocal } from './cartSlice';

const API_URL = 'http://localhost:5000/api/appointments';

// Helper to get token from state
const getAuthConfig = (getState) => {
  const { auth } = getState();
  return {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  };
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/my`, getAuthConfig(getState));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'appointments/bookAppointment',
  async ({ doctorId, date, timeSlot, razorpay_order_id, razorpay_payment_id, razorpay_signature }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/book`,
        { doctorId, date, timeSlot, razorpay_order_id, razorpay_payment_id, razorpay_signature },
        getAuthConfig(getState)
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book appointment');
    }
  }
);

const initialState = {
  appointments: [],
  loading: false,
  error: null,
  bookingSuccess: false
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    resetBookingSuccess: (state) => {
      state.bookingSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
        state.bookingSuccess = true;
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookingSuccess = false;
      });
  },
});

export const { resetBookingSuccess } = appointmentSlice.actions;
export default appointmentSlice.reducer;
