import { combineReducers } from 'redux';

import accountDragons from './accountDragonsSlice';
import accountInfo from './accountInfoSlice';
import account from './accountSlice';
import dragon from './dragonSlice';
import generation from './generationSlice';
import publicDragons from './publicDragonsSlice';

export default combineReducers({
  account,
  generation,
  dragon,
  accountDragons,
  accountInfo,
  publicDragons,
});
