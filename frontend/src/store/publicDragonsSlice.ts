import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { BACKEND } from '../config';
import fetchState from './fetchState';

export const fectchPublicDragons = createAsyncThunk(
  'publicDragons/fectchPublicDragons',
  async () => {
    return await fetch(`${BACKEND.ADDRESS}/dragon/public-dragons`).then((response) =>
      response.json()
    );
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

const initialState = { dragons: [] };

const fectchPublicDragonsSlice = createSlice({
  name: 'publicDragons',
  initialState,
  reducers: {},
  extraReducers: {
    [fectchPublicDragons.pending.type]: (state: reduxAccountDragonsState) => {
      state.status = fetchState.fetching;
    },
    [fectchPublicDragons.fulfilled.type]: (state: reduxAccountDragonsState, action) => {
      if (action.type === 'error') {
        state.status = fetchState.error;
        state.message = action.message;
      } else {
        state.status = fetchState.success;
        state.dragons = action.dragons;
      }
    },
    [fectchPublicDragons.rejected.type]: (state: reduxAccountDragonsState, action) => {
      state.status = fetchState.error;
      state.message = action.message;
    },
  },
});

export default fectchPublicDragonsSlice;
