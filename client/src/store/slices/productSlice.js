import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const MEDICINES_URL = 'http://localhost:5000/api/medicines';
const LAB_TESTS_URL = 'http://localhost:5000/api/lab-tests';

export const fetchMedicines = createAsyncThunk('products/fetchMedicines', async (search = '', { rejectWithValue }) => {
  try {
    const response = await axios.get(MEDICINES_URL, { params: { search } });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch medicines');
  }
});

export const fetchLabTests = createAsyncThunk('products/fetchLabTests', async (search = '', { rejectWithValue }) => {
  try {
    const response = await axios.get(LAB_TESTS_URL, { params: { search } });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch lab tests');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    medicines: [],
    labTests: [],
    searchTerm: '',
    loading: false,
    error: null,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = false;
        state.labTests = action.payload;
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm } = productSlice.actions;
export default productSlice.reducer;
