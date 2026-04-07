import { configureStore } from '@reduxjs/toolkit';
<<<<<<< HEAD
import authReducer         from './slices/authSlice';
import { apiSlice }        from './api/apiSlice';

export const store = configureStore({
  reducer: {
    auth:                   authReducer,
=======
import authReducer from './slices/authSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
>>>>>>> 2a6943941c42e85197127f71468cb09d69d026ac
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

export default store;
