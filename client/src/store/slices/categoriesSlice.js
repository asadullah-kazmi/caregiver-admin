import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  }
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload.categories || [];
      state.pagination = action.payload.pagination || state.pagination;
    },
    addCategory: (state, action) => {
      state.categories.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateCategory: (state, action) => {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    removeCategory: (state, action) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload);
      state.pagination.total -= 1;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setLoading, setCategories, addCategory, updateCategory, removeCategory, setError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
