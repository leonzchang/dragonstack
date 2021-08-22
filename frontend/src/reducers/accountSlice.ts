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
  extraReducers: (builder) => {
    builder.addCase(signup.pending, (state) => {
      state.status = fetchState.fetching;
    });

    builder.addCase(signup.fulfilled, (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.loggedIn = true;
      }
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    });
    builder.addCase(login.pending, (state) => {
      state.status = fetchState.fetching;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.loggedIn = true;
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    });
    builder.addCase(fetchAuthenticated.pending, (state) => {
      state.status = fetchState.fetching;
    });

    builder.addCase(fetchAuthenticated.fulfilled, (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.loggedIn = action.payload.authenticated;
      }
    });
    builder.addCase(fetchAuthenticated.rejected, (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    });
    builder.addCase(logout.pending, (state) => {
      state.status = fetchState.fetching;
    });

    builder.addCase(logout.fulfilled, (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.loggedIn = false;
      }
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    });
  },
});

export default fectchAccountSlice.reducer;
