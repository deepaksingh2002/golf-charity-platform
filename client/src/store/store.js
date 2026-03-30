import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './slices/adminSlice';
import authReducer from './slices/authSlice';
import charityReducer from './slices/charitySlice';
import drawReducer from './slices/drawSlice';
import scoreReducer from './slices/scoreSlice';
import subscriptionReducer from './slices/subscriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scores: scoreReducer,
    charities: charityReducer,
    draws: drawReducer,
    subscription: subscriptionReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['draws/uploadProof/pending', 'draws/uploadProof/fulfilled'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;
