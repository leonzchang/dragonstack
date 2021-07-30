import hash from '../account/helper'
import Session from '../account/session'
import AccountTable from '../account/table'
import { Response } from 'express';

interface setSessionInfo{
    username:string,
    res:Response
    sessionId?:string
}

interface setSessionCookieInfo{
    sessionString:string,
    res:Response
}

const setSession = ({username, res, sessionId}:setSessionInfo) =>{
    return new Promise<{message:string}>((resolve ,reject)=>{
        let session:Session,sessionString:string

        if(sessionId){
            sessionString = Session.sessionString({username, id:sessionId})

            setSessionCookie({ sessionString, res})

            resolve({ message:'session restored' })
        }else{
            session = new Session({username})
            sessionString = session.toString()

            AccountTable.updateSessionId({
                sessionId: session.id,
                usernameHash: hash(username)
            })
            .then(()=>{
                setSessionCookie({ sessionString, res})
    
                resolve({message:'session created'})
            })
            .catch(error=> reject(error))
        }
    })
}

const setSessionCookie = ({ sessionString, res}:setSessionCookieInfo) => {
    res.cookie('sessionString',sessionString,{
        expires: new Date(Date.now()+ 3600000),
        httpOnly: true,
        // secure:true  //use with https
    })
}

export default setSession