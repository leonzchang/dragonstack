import { DRAGON } from "../actions/type"
import fetchState from './fetchState'


interface traitsType {
    traitType: string
    traitValue: string
}

interface dragonType{
    dragonId: string
    generationId: string
    birthdate: string
    nickname: string
    traits: traitsType[]
    message?:string
    status?:string
}

interface dragonAction{
    type:string,
    dragon?:dragonType,
    message?:string
}


const DEFAULT_DRAGON = {dragonId:'',generationId:'',birthdate:'',nickname:'',traits:[]}

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