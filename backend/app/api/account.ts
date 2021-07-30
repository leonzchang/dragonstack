import { Router } from 'express'
import AccountTable from '../account/table'
import Session from '../account/session'
import hash from '../account/helper'
import setSession from './helper'


interface ErrorType extends Error {
    statusCode?: number;
}

const router = Router()

router.post('/signup', (req, res, next) => {
    const {username,password} = req.body
    const usernameHash = hash(username)
    const passwordHash = hash(password)

    AccountTable.getAccount({usernameHash })
        .then(({account})=>{
            if(!account){
                return AccountTable.storeAccount({usernameHash, passwordHash})
            }else{
                const error:ErrorType = new Error('This username has already been taken')
 
                error.statusCode = 409
                
                throw(error)
            }
        })
        .then(() =>{
            return setSession({username,res})
        })
        .then(({message})=>{
            res.json({message})
        })
        .catch(error => next(error))
})

router.post('/login', (req, res, next) => {
    const { username , password } = req.body

    AccountTable.getAccount({ usernameHash:hash(username)})
    .then(({account}) => {
        if (account && account.passwordHash === hash(password)){
            const {sessionId} = account

            return setSession({ username, res, sessionId})
        }else{
            const error:ErrorType = new Error('Incorrect username/password')

            error.statusCode = 409

            throw error
        }
    })
    .then(({message})=>res.json({message}))
    .catch(error => next(error))
})


router.get('/logout', (req, res, next) => {
    const {username} = Session.parse(req.cookies.sessionString) 

    AccountTable.updateSessionId({
        sessionId:null,
        usernameHash:hash(username)
    })
    .then(()=>{
        res.clearCookie('sessionString')

        res.json({message:'Successful logout'})
    })
    .catch(error => next(error))
})


export default router
