/**
 * Redux Store Configuration
 * Combines RTK Query API and Redux slices with middleware
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '@/services/api';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import filtersReducer from './slices/filtersSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    // RTK Query API reducer
    [baseApi.reducerPath]: baseApi.reducer,
    
    // Feature slices
    auth: authReducer,
    ui: uiReducer,
    filters: filtersReducer,
    admin: adminReducer,
  },
  
  // Add RTK Query middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure serialization check for better performance
      serializableCheck: {
        // Ignore these action types from serialization check
        ignoredActions: [
          'api/executeQuery/fulfilled',
          'api/executeQuery/pending',
          'api/executeMutation/fulfilled',
          'api/executeMutation/pending',
        ],
        // Ignore these field paths in state
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['api.queries', 'api.mutations'],
      },
    }).concat(baseApi.middleware),

  // Enable Redux DevTools in development
  devTools: true,
});

// Setup listeners for refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

// Infer types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store instance
export default store;
