import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import fectchFromAccount from './accountHelper';
import fetchState from './fetchState';

export const fectchAccountDragons = createAsyncThunk('accountDragon/fectchAccountDragons', () =>
  fectchFromAccount({ endpoint: 'dragons', options: { credentials: 'include' } })
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

const fectchAccountDragonsSlice = createSlice({
  name: 'accountDragon',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fectchAccountDragons.pending, (state) => {
      state.status = fetchState.fetching;
    });

    builder.addCase(fectchAccountDragons.fulfilled, (state, action) => {
      if (action.payload.type === 'error') {
        state.status = fetchState.error;
        state.message = action.payload.message;
      } else {
        state.status = fetchState.success;
        state.message = action.payload.message;
        state.dragons = action.payload.dragons;
      }
    });
    builder.addCase(fectchAccountDragons.rejected, (state, action) => {
      state.status = fetchState.error;
      state.message = action.error.message;
    });
  },
});

export default fectchAccountDragonsSlice.reducer;
