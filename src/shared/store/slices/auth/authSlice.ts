import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthState, MeResponse } from '@/shared/interfaces/auth';
import { IUsersType } from '@/shared/interfaces/user';

const initialState: IAuthState = { 
  token: null,
  rolUser: null,
  status: 'checking',
  me: null,
  loadingMe: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticate: (state, action: PayloadAction<string>) => {
      state.status = 'authenticated';
      state.token = action.payload;
    },

    notAuthenticate: (state) => {
      state.status = 'not-authenticated';
      state.token = null;
      state.rolUser = null;

      // ✅ nuevo
      state.me = null;
      state.loadingMe = false;
    },

    addRolUserAuth: (state, action: PayloadAction<keyof IUsersType>) => {
      state.rolUser = action.payload;
    },

    // ✅ nuevo
    setMe: (state, action: PayloadAction<MeResponse | null>) => {
      state.me = action.payload;
      if (action.payload?.type) {
        state.rolUser = action.payload.type; // opcional: sync rol
      }
    },

    // ✅ nuevo
    setLoadingMe: (state, action: PayloadAction<boolean>) => {
      state.loadingMe = action.payload;
    },
  },
});

export const {
  authenticate,
  notAuthenticate,
  addRolUserAuth,
  setMe,
  setLoadingMe,
} = authSlice.actions;