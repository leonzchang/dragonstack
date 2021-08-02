import { GENERATION} from "./type"
import { BACKEND } from "../config"
import { AppDispatch} from '..'


export const fetchGeneration = () => (dispatch:AppDispatch) => {
    dispatch({ type:GENERATION.FETCH })

    return fetch(`${BACKEND.ADDRESS}/generation`)
    .then(response => response.json())
    .then(json =>{
        if(json.type === 'error'){
            dispatch({ 
                type:GENERATION.FETCH_ERROR ,
                message:json.message
            })
        }else{
            dispatch({ 
                type:GENERATION.FETCH_SUCCESS, 
                generation:json.generation 
            })
        }
    })
    .catch(error => dispatch({
        type:GENERATION.FETCH_ERROR,
        message:error.message 
    }))
}
