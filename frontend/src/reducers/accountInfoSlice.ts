import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import fectchFromAccount from './accountHelper';
import fetchState from './fetchState';

export const fectchAccountInfo = createAsyncThunk('dragon/fectchAccountInfo', () =>
  fectchFromAccount({ endpoint: 'info', options: { credentials: 'include' } })
);

interface reduxAccountInfoState {
  balance?: number;
  username?: string;
  message?: string;
  status?: string;
}

const initialState: reduxAccountInfoState = {};

const fetchAccountInfoSlice = createSlice({
  name: 'accountInfo',
  initialState,
  reducers: {},
  extraReducers: {
    [fectchAccountInfo.pending.type]: (state) => {
      state.status = fetchState.fetching;
    },
    [fectchAccountInfo.fulfilled.type]: (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.balance = action.payload.info.balance;
        state.username = action.payload.info.username;
      }
    },
    [fectchAccountInfo.rejected.type]: (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    },
  },
});

export default fetchAccountInfoSlice.reducer;
