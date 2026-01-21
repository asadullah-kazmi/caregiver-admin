import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import pictogramsReducer from './slices/pictogramsSlice';
import statsReducer from './slices/statsSlice';
import categoriesReducer from './slices/categoriesSlice';
import requestsReducer from './slices/requestsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    pictograms: pictogramsReducer,
    stats: statsReducer,
    categories: categoriesReducer,
    requests: requestsReducer,
  },
});
