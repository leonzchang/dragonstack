import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { BACKEND } from '../config';
import fetchState from './fetchState';

interface fetchGenerationJson {
  type: string;
  message: string;
  generation: {
    expiration: string;
    generationId: number;
  };
}

export const fetchGeneration = createAsyncThunk('generation/fetchGeneration', async () => {
  const response = await fetch(`${BACKEND.ADDRESS}/generation`);
  const json: fetchGenerationJson = await response.json();
  return json;
});

interface generationType {
  generationId?: number;
  expiration?: string;
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
  extraReducers: (builder) => {
    builder.addCase(fetchGeneration.pending, (state) => {
      state.status = fetchState.fetching;
    });

    builder.addCase(fetchGeneration.fulfilled, (state, action) => {
      if (action.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.generationId = action.payload.generation.generationId;
        state.expiration = action.payload.generation.expiration;
      }
    });
    builder.addCase(fetchGeneration.rejected, (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    });
  },
});

export default fetchGenerationSlice.reducer;
