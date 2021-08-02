import { DRAGON } from "../actions/type"
import fetchState from './fetchState'


interface traitsType {
    traitType: string
    traitValue: string
}

interface dragonType{
    dragonId?: number
    generationId?: number
    birthdate?: Date
    nickname?: string
    traits?: traitsType[]
    isPublic?:boolean
    saleValue?:number
    sireValue?:number
    message?:string
    status?:string
}

interface dragonAction{
    type:string,
    dragon?:dragonType,
    message?:string
}


// const DEFAULT_DRAGON = {dragonId:'',generationId:'',birthdate:'',nickname:'',traits:[]}
const DEFAULT_DRAGON = {}

const dragonReducer = (state:dragonType = DEFAULT_DRAGON ,action:dragonAction) =>{
    switch(action.type){
        case DRAGON.FETCH:
            return {...state, status:fetchState.fetching}
        case DRAGON.FETCH_ERROR:
            return {...state, message:action.message, status:fetchState.error}
        case DRAGON.FETCH_SUCCESS:
            return {...state , ...action.dragon, status:fetchState.success}
        default:
            return state 

    }
}

export default dragonReducer 