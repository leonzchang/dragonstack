import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { BACKEND } from '../config';
import fetchState from './fetchState';

interface fetchDragonJson {
  type: string;
  message: string;
  dragon: dragonType;
}

export const fetchDragon = createAsyncThunk('dragon/fetchDragon', async () => {
  const response = await fetch(`${BACKEND.ADDRESS}/dragon/new`, { credentials: 'include' });
  const json: fetchDragonJson = await response.json();
  return json;
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
  extraReducers: (builder) => {
    builder.addCase(fetchDragon.pending, (state) => {
      state.status = fetchState.fetching;
    });

    builder.addCase(fetchDragon.fulfilled, (state, action) => {
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
    });
    builder.addCase(fetchDragon.rejected, (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    });
  },
});

export default fetchDragonSlice.reducer;
