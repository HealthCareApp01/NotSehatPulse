import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleTokenExpired } from './authSlice';

const API_URL = 'http://localhost:5000/api/cart';

// Helper to get token from state
const getAuthConfig = (getState) => {
  const { auth } = getState();
  return {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  };
};

// Helper: checks if error is a token expiry and dispatches logout
const handleAuthError = (error, dispatch) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  if (status === 401 && code === 'TOKEN_EXPIRED') {
    dispatch(handleTokenExpired());
  }
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const response = await axios.get(API_URL, getAuthConfig(getState));
    return response.data.data;
  } catch (error) {
    handleAuthError(error, dispatch);
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ productId, quantity, itemModel }, { getState, dispatch, rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/add`, { productId, quantity, itemModel }, getAuthConfig(getState));
    return response.data.data;
  } catch (error) {
    handleAuthError(error, dispatch);
    return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
  }
});

export const placeOrder = createAsyncThunk('cart/placeOrder', async (orderData, { getState, dispatch, rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:5000/api/orders', orderData, getAuthConfig(getState));
    return response.data.data;
  } catch (error) {
    handleAuthError(error, dispatch);
    return rejectWithValue(error.response?.data?.message || 'Failed to place order');
  }
});

export const updateCartQuantity = createAsyncThunk('cart/updateCartQuantity', async ({ productId, quantity }, { getState, dispatch, rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/update`, { productId, quantity }, getAuthConfig(getState));
    return response.data.data;
  } catch (error) {
    handleAuthError(error, dispatch);
    return rejectWithValue(error.response?.data?.message || 'Failed to update quantity');
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (productId, { getState, dispatch, rejectWithValue }) => {
  try {
    const response = await axios.delete(`${API_URL}/remove/${productId}`, getAuthConfig(getState));
    return response.data.data;
  } catch (error) {
    handleAuthError(error, dispatch);
    return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const response = await axios.delete(`${API_URL}/clear`, getAuthConfig(getState));
    return response.data.data;
  } catch (error) {
    handleAuthError(error, dispatch);
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: { items: [] },
    loading: false,
    error: null,
    orderSuccess: false,
  },
  reducers: {
    clearCartLocal: (state) => {
      state.cart = { items: [] };
      state.orderSuccess = true;
    },
    resetOrderSuccess: (state) => {
      state.orderSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = { items: [] };
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.loading = false;
        state.cart = { items: [] };
        state.orderSuccess = true;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartLocal, resetOrderSuccess } = cartSlice.actions;
export default cartSlice.reducer;
