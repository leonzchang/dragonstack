import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { BACKEND } from '../config';
import fetchState from './fetchState';

export const fetchGeneration = createAsyncThunk('generation/fetchGeneration', async () => {
  return await fetch(`${BACKEND.ADDRESS}/generation`).then((response) => response.json());
});

interface generationType {
  generationId?: number;
  expiration?: Date;
}

interface reduxGenerationState extends generationType {
  message?: string;
  status?: string;
}

const initialState: reduxGenerationState = {};

const fetchGenerationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchGeneration.pending.type]: (state) => {
      state.status = fetchState.fetching;
    },
    [fetchGeneration.fulfilled.type]: (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.generationId = action.payload.generation.generationId;
        state.expiration = action.payload.generation.expiration;
      }
    },
    [fetchGeneration.rejected.type]: (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    },
  },
});

export default fetchGenerationSlice.reducer;
