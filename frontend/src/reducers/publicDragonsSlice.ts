import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { BACKEND } from '../config';
import fetchState from './fetchState';

interface fectchPublicDragonsJson {
  type: string;
  message: string;
  dragons: dragonType[];
}

export const fectchPublicDragons = createAsyncThunk(
  'publicDragons/fectchPublicDragons',
  async () => {
    const response = await fetch(`${BACKEND.ADDRESS}/dragon/public-dragons`);
    const json: fectchPublicDragonsJson = await response.json();
    return json;
  }
);

interface traitsType {
  traitType: string;
  traitValue: string;
}

interface dragonType {
  dragonId: number;
  generationId: number;
  birthdate: Date;
  nickname: string;
  isPublic: boolean;
  saleValue: number;
  sireValue: number;
  traits: traitsType[];
}

interface reduxAccountDragonsState {
  dragons?: dragonType[];
  message?: string;
  status?: string;
}

const initialState: reduxAccountDragonsState = { dragons: [] };

const fectchPublicDragonsSlice = createSlice({
  name: 'publicDragons',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fectchPublicDragons.pending, (state) => {
      state.status = fetchState.fetching;
    });

    builder.addCase(fectchPublicDragons.fulfilled, (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.dragons = action.payload.dragons;
      }
    });
    builder.addCase(fectchPublicDragons.rejected, (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    });
  },
});

export default fectchPublicDragonsSlice.reducer;
