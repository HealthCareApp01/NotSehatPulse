import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Helper to get token
const getAuthConfig = (getState) => {
  const { auth } = getState();
  return {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  };
};

// Fetch unverified doctors
export const fetchUnverifiedDoctors = createAsyncThunk(
  'admin/fetchUnverifiedDoctors',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/unverified-doctors`, getAuthConfig(getState));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unverified doctors');
    }
  }
);

// Verify doctor
export const verifyDoctor = createAsyncThunk(
  'admin/verifyDoctor',
  async (doctorId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/verify-doctor/${doctorId}`, {}, getAuthConfig(getState));
      return { doctorId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify doctor');
    }
  }
);

// Mark as fraud
export const markFraudDoctor = createAsyncThunk(
  'admin/markFraudDoctor',
  async (doctorId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/fraud-doctor/${doctorId}`, {}, getAuthConfig(getState));
      return { doctorId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark doctor as fraud');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    unverifiedDoctors: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearAdminMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUnverifiedDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnverifiedDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.unverifiedDoctors = action.payload;
      })
      .addCase(fetchUnverifiedDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify
      .addCase(verifyDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(verifyDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Remove from list
        state.unverifiedDoctors = state.unverifiedDoctors.filter(d => d.user._id !== action.payload.doctorId);
      })
      .addCase(verifyDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fraud
      .addCase(markFraudDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(markFraudDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Remove from list
        state.unverifiedDoctors = state.unverifiedDoctors.filter(d => d.user._id !== action.payload.doctorId);
      })
      .addCase(markFraudDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAdminMessages } = adminSlice.actions;
export default adminSlice.reducer;
