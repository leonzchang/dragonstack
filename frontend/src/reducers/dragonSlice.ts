import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { BACKEND } from '../config';
import fetchState from './fetchState';

export const fetchDragon = createAsyncThunk('dragon/fetchDragon', async () => {
  return await fetch(`${BACKEND.ADDRESS}/dragon/new`, {
    credentials: 'include',
  }).then((response) => response.json());
});

interface traitsType {
  traitType: string;
  traitValue: string;
}

interface dragonType {
  dragonId?: number;
  generationId?: number;
  birthdate?: Date;
  nickname?: string;
  traits?: traitsType[];
  isPublic?: boolean;
  saleValue?: number;
  sireValue?: number;
}

interface reduxDragonState {
  dragonInfo: dragonType;
  message?: string;
  status?: string;
}

const initialState: reduxDragonState = { dragonInfo: {} };

const fetchDragonSlice = createSlice({
  name: 'dragon',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchDragon.pending.type]: (state) => {
      state.status = fetchState.fetching;
    },
    [fetchDragon.fulfilled.type]: (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.dragonInfo.dragonId = action.payload.dragon.dragonId;
        state.dragonInfo.generationId = action.payload.dragon.generationId;
        state.dragonInfo.birthdate = action.payload.dragon.birthdate;
        state.dragonInfo.nickname = action.payload.dragon.nickname;
        state.dragonInfo.traits = action.payload.dragon.traits;
        state.dragonInfo.isPublic = action.payload.dragon.isPublic;
        state.dragonInfo.saleValue = action.payload.dragon.saleValue;
        state.dragonInfo.sireValue = action.payload.dragon.sireValue;
      }
    },
    [fetchDragon.rejected.type]: (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    },
  },
});

export default fetchDragonSlice.reducer;
