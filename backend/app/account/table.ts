import pool from '../../databasePool'

interface accountInfo {
    usernameHash: string,
    passwordHash: string,
}

interface getaccountInfo {
    usernameHash: string,
}

interface updateSessionIdInfo {
    usernameHash: string,
    sessionId:string | null
}

interface getaccountReturnType{
    account:{
        id: number,
        passwordHash:string
        sessionId:string
    }
}



export default class AccountTable{
    static storeAccount({usernameHash,passwordHash}:accountInfo){
        return new Promise<void>((resolve, reject) => {
            pool.query(
                'INSERT INTO account("usernameHash", "passwordHash") VALUES($1, $2)',
                [usernameHash, passwordHash],
                (error, response) => {
                    if (error) return reject(error)
                
                    resolve()
                }
            )
        })
    }
    
    static getAccount({usernameHash}:getaccountInfo){
        return new Promise<getaccountReturnType>((resolve, reject) => {
            pool.query(
                'SELECT id, "passwordHash","sessionId" FROM account WHERE "usernameHash" = $1',
                [usernameHash],
                (error, response) => {
                    if (error) return reject(error)
                
                    resolve({account:response.rows[0]})
                }
            )
        })
    }

    static updateSessionId({sessionId, usernameHash}:updateSessionIdInfo){
        return new Promise<void>((resolve, reject) => {
            pool.query(
                'UPDATE account SET "sessionId" = $1 WHERE "usernameHash" = $2',
                [sessionId, usernameHash],
                (error, response) => {
                    if (error) return reject(error)

                    resolve()
                }
            )
        })
    }
}