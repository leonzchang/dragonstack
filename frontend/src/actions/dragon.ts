import { DRAGON} from "./type"
import { BACKEND } from "../config"
import { AppDispatch} from '..'


export const fetchDragon = () => (dispatch:AppDispatch)  => {
    dispatch({ type:DRAGON.FETCH })

    return fetch(`${BACKEND.address}/dragon/new`,{
        credentials:'include'
    })
    .then(response => response.json())
    .then(json =>{
        if(json.type === 'error'){
            dispatch({ 
                type:DRAGON.FETCH_ERROR ,
                message:json.message
            })
        }else{
            dispatch({ 
                type:DRAGON.FETCH_SUCCESS, 
                dragon:json.dragon 
            })
        }
    })
    .catch(error => dispatch({
        type:DRAGON.FETCH_ERROR,
        message:error.message 
    }))
}
