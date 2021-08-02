import { PUBLIC_DRAGONS } from "../actions/type"
import fetchState from './fetchState'


interface dragonInfo {
    dragonId: string
    generationId: string
    birthdate: string
    nickname: string
    traits: Array<{traitType: string ,traitValue: string}>
    isPublic:boolean
    saleValue:number
    sireValue:number
}

interface publicDragonsType{
    dragons?:Array<dragonInfo>
    message?:string
    status?:string
}

interface publicDragonsAction{
    type:string,
    dragons?:Array<dragonInfo>
    message?:string
}


const DEFAULT_PUBLIC_DRAGONS = {dragons:[]}

const publicDragonsReducer = (state:publicDragonsType= DEFAULT_PUBLIC_DRAGONS  ,action:publicDragonsAction) =>{
    switch(action.type){
        case PUBLIC_DRAGONS.FETCH:
            return {...state, status:fetchState.fetching}
        case PUBLIC_DRAGONS.FETCH_ERROR:
            return {...state, message:action.message, status:fetchState.error}
        case PUBLIC_DRAGONS.FETCH_SUCCESS:
            return {...state , dragons:action.dragons, status:fetchState.success}
        default:
            return state 

    }
}

export default publicDragonsReducer 