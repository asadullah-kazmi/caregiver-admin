import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRequests: (state, action) => {
      state.requests = action.payload.requests || [];
      state.pagination = action.payload.pagination || state.pagination;
    },
    updateRequest: (state, action) => {
      const index = state.requests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    },
    removeRequest: (state, action) => {
      state.requests = state.requests.filter(req => req.id !== action.payload);
      state.pagination.total -= 1;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setLoading, setRequests, updateRequest, removeRequest, setError } = requestsSlice.actions;
export default requestsSlice.reducer;
