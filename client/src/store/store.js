import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import scoreReducer        from './slices/scoreSlice';
import charityReducer      from './slices/charitySlice';
import drawReducer         from './slices/drawSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import adminReducer        from './slices/adminSlice';
import { apiSlice }        from './api/apiSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    scores:       scoreReducer,
    charities:    charityReducer,
    draws:        drawReducer,
    subscription: subscriptionReducer,
    admin:        adminReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

export default store;
