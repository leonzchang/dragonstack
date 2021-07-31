import { ACCOUNT } from "./type";
import { BACKEND } from "../config";
import { AppDispatch} from '..'

interface userInfo{
    username:string,
    password:string
}

interface fectchFromAccountInfo{
    endpoint:string,
    options:RequestInit,
    SUCCESS_TYPE:string
}


const fectchFromAccount = ({endpoint, options, SUCCESS_TYPE}:fectchFromAccountInfo) => (dispatch:AppDispatch) => {
    dispatch({ type:ACCOUNT.FETCH })

    return fetch(`${BACKEND.address}/account/${endpoint}`, options)
    .then(response => response.json())
    .then(json =>{
        if(json.type === 'error'){
            dispatch({ 
                type:ACCOUNT.FETCH_ERROR,
                message:json.message
            })
        }else{
            dispatch({ 
                type:SUCCESS_TYPE, 
                ...json //message object from setSession
            })
        }
    })
    .catch(error => dispatch({
        type:ACCOUNT.FETCH_ERROR,
        message:error.message 
    }))
}


export const signup = ({username, password}:userInfo) => fectchFromAccount({
    endpoint:'signup',
    options:{
        method:'POST',
        body:JSON.stringify({username, password}),
        headers:{'Content-Type':'application/json'},
        credentials:'include'
    },
    SUCCESS_TYPE:ACCOUNT.FETCH_SUCCESS
})

export const login = ({username, password}:userInfo) => fectchFromAccount({
    endpoint:'login',
    options:{
        method:'POST',
        body:JSON.stringify({username, password}),
        headers:{'Content-Type':'application/json'},
        credentials:'include'
    },
    SUCCESS_TYPE:ACCOUNT.FETCH_SUCCESS
})
 
export const fetchAuthenticated = () => fectchFromAccount({
    endpoint:'authenticated',
    options:{
        credentials:'include'
    },
    SUCCESS_TYPE:ACCOUNT.FETCH_AUTHENTICATED_SUCCESS
})

export const logout = () => fectchFromAccount({
    endpoint:'logout',
    options:{
        credentials:'include'
    },
    SUCCESS_TYPE:ACCOUNT.FETCH_LOGOUT_SUCCESS
})









