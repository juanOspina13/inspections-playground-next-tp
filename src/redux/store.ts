import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import inspectionReducer from './slices/inspectionSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    inspection: inspectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
