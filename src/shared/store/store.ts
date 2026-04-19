import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { authSlice, userAccessSlice } from './slices';
import { storeCartSlice } from './slices/store';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    storeCart: storeCartSlice.reducer,
    userAccess: userAccessSlice.reducer
  },
})
  
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;