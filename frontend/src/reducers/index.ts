import { combineReducers } from "redux";
import account from "./account";
import accountDragons from './accountDragons'
import accountInfo from './accountInfo'
import generation from "./generation";
import dragon from "./dragon"
import publicDragons from "./publicDragons";



export default combineReducers({ account, generation, dragon, accountDragons, accountInfo, publicDragons})

