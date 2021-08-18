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

const initialState = {};

const fetchGenerationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchGeneration.pending.type]: (state: reduxGenerationState) => {
      state.status = fetchState.fetching;
    },
    [fetchGeneration.fulfilled.type]: (state: reduxGenerationState, action) => {
      if (action.type === 'error') {
        state.status = fetchState.error;
        state.message = action.message;
      } else {
        state.status = fetchState.success;
        state.generationId = action.generation.generationId;
        state.expiration = action.generation.expiration;
      }
    },
    [fetchGeneration.rejected.type]: (state: reduxGenerationState, action) => {
      state.status = fetchState.error;
      state.message = action.message;
    },
  },
});

export default fetchGenerationSlice;
