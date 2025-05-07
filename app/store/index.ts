import { configureStore } from '@reduxjs/toolkit';
import liveStatusReducer from './liveStatusSlice';
import authReducer from './authSlice';
import userDataReducer from './userDataSlice';
import mechanicDataReducer from './mechanicDataSlice';

export const store = configureStore({
  reducer: {
    liveStatus: liveStatusReducer,
    auth: authReducer,
    userData: userDataReducer,
    mechanicData: mechanicDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;