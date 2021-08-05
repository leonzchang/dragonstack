import { ACCOUNT_INFO } from "../actions/type";
import fetchState from "./fetchState";


interface reduxAccountInfoState{
    balance?:number,
    username?:string
    message?:string
    status?:string
}


interface accountInfoAction{
    type:string,
    message?:string
    info?: {
        balance:number,
        username:string
    }
}


const DEFAULT_ACCOUNTINFO = {}

const accountInfoReducer = (state:reduxAccountInfoState = DEFAULT_ACCOUNTINFO ,action:accountInfoAction) =>{
    switch(action.type){
        case ACCOUNT_INFO.FETCH:
            return {...state, status:fetchState.fetching}
        case ACCOUNT_INFO.FETCH_ERROR:
            return {...state, message:action.message, status:fetchState.error}
        case ACCOUNT_INFO.FETCH_SUCCESS:
            return {...state, status:fetchState.success, message:action.message, ...action.info}
        default:
            return state 
    }
}

export default accountInfoReducer 