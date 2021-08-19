import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import fectchFromAccount from './accountHelper';
import fetchState from './fetchState';

interface userInfo {
  username: string;
  password: string;
}

export const signup = createAsyncThunk('account/signup', ({ username, password }: userInfo) =>
  fectchFromAccount({
    endpoint: 'signup',
    options: {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
  })
);
export const login = createAsyncThunk('account/login', ({ username, password }: userInfo) =>
  fectchFromAccount({
    endpoint: 'login',
    options: {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
  })
);
export const fetchAuthenticated = createAsyncThunk('account/fetchAuthenticated', () =>
  fectchFromAccount({
    endpoint: 'authenticated',
    options: {
      credentials: 'include',
    },
  })
);
export const logout = createAsyncThunk('account/logout', () =>
  fectchFromAccount({
    endpoint: 'logout',
    options: {
      credentials: 'include',
    },
  })
);

interface reduxAccountSate {
  loggedIn?: boolean;
  message?: string;
  status?: string;
}

const initialState: reduxAccountSate = { loggedIn: false };

const fectchAccountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: {
    [signup.pending.type]: (state) => {
      state.status = fetchState.fetching;
    },
    [signup.fulfilled.type]: (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.loggedIn = true;
      }
    },
    [signup.rejected.type]: (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    },
    [login.pending.type]: (state) => {
      state.status = fetchState.fetching;
    },
    [login.fulfilled.type]: (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.loggedIn = true;
      }
    },
    [login.rejected.type]: (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    },
    [fetchAuthenticated.pending.type]: (state) => {
      state.status = fetchState.fetching;
    },
    [fetchAuthenticated.fulfilled.type]: (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.loggedIn = action.payload.authenticated;
      }
    },
    [fetchAuthenticated.rejected.type]: (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    },
    [logout.pending.type]: (state) => {
      state.status = fetchState.fetching;
    },
    [logout.fulfilled.type]: (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.loggedIn = false;
      }
    },
    [logout.rejected.type]: (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    },
  },
});

export default fectchAccountSlice.reducer;
