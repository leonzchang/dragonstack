import { ACCOUNT_DRAGONS } from "../actions/type";
import fetchState from './fetchState'


interface traitsType {
    traitType: string
    traitValue: string
}

interface dragonType{
    dragonId: number
    generationId: number
    birthdate: Date
    nickname: string
    isPublic:boolean
    saleValue:number
    sireValue:number
    traits: traitsType[]
}

interface reduxAccountDragonsState{
    dragons?: dragonType[]
    message?:string
    status?:string
}


interface accountDragonsAction{
    type:string,
    message?:string
    dragons?:dragonType[]
}


const DEFAULT_ACCOUNT_DRAGONS = {dragons:[]}

const accountDragonsReducer = (state:reduxAccountDragonsState = DEFAULT_ACCOUNT_DRAGONS, action:accountDragonsAction) =>{
    switch(action.type){
        case ACCOUNT_DRAGONS.FETCH:
            return {...state, status:fetchState.fetching}
        case ACCOUNT_DRAGONS.FETCH_ERROR:
            return {...state, message:action.message, status:fetchState.error}
        case ACCOUNT_DRAGONS.FETCH_SUCCESS:
            return {...state, status:fetchState.success, dragons:action.dragons}
        default:
            return state 
    }
}

export default accountDragonsReducer 