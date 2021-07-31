import pool from '../../databasePool'

interface storeAccountDragonInfo {
    accountId: number,
    dragonId:number
}

interface getAccountDragonInfo{
    accountId:number
}

interface getAccountDragonReturnType{
    accountDragons:Array<{dragonId:number}>
}

export default class AccountDragonTable{
    static storeAccountDragon({ accountId, dragonId }:storeAccountDragonInfo){
        return new Promise<void>((resolve, reject) => {
            pool.query(
                'INSERT INTO accountDragon("accountId","dragonId") VALUES($1,$2)',
                [accountId,dragonId],
                (error, response) => {
                    if (error) return reject(error)

                    resolve()
                }
            )
        })
    }

    static getAccountDragon({ accountId }:getAccountDragonInfo){
        return new Promise<getAccountDragonReturnType>((resolve, reject) => {
            pool.query(
                'SELECT "dragonId" FROM accountDragon where "accountId" = $1',
                [accountId],
                (error, response) => {
                    if (error) return reject(error)
                    
                    resolve({accountDragons: response.rows})
                }
            )
        })
    }
}