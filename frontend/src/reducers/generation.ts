import { GENERATION } from "../actions/type"
import fetchState from './fetchState'


interface generationType{
    generationId ?:number,
    expiration ?:Date 
}

interface reduxGenerationState extends generationType{
    message?:string
    status?:string
}

interface generationAction{
    type:string,
    generation?:generationType,
    message?:string
}


const DEFAULT_GENERATION = {}

const generationReducer = (state:reduxGenerationState = DEFAULT_GENERATION ,action:generationAction) =>{
    switch(action.type){
        // case GENERATION.FETCH:
        //     return {...state, status:fetchState.fetching}
        case GENERATION.FETCH_ERROR:
            return {...state, message:action.message, status:fetchState.error}
        case GENERATION.FETCH_SUCCESS:
            return {...state , ...action.generation, status:fetchState.success }
        default:
            return state 

    }
}

export default generationReducer 