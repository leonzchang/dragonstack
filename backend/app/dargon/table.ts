import pool from '../../databasePool'
import Dragon from './index'
import DragonTraitTable from '../dragonTrait/table'

interface getDragonInfo {
    birthdate: Date,
    nickname: string,
    generationId: number
}

export default class DragonTable {
    static storeDragon(dragon: Dragon): Promise<{ dragonId: number }> {
        const { birthdate, nickname, generationId } = dragon

        return new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO dragon(birthdate,nickname,"generationId") VALUES($1, $2, $3) RETURNING id',
                [birthdate, nickname, generationId],
                (error, response) => {
                    if (error) return reject(error)

                    const dragonId: number = response.rows[0].id

                    Promise.all(dragon.traits.map(({ traitType, traitValue }) => {
                        return DragonTraitTable.storeDragonTrait({ dragonId, traitType, traitValue })
                    }))
                        .then(() => resolve({ dragonId }))
                        .catch(error => reject(error))
                }
            )
        })
    }

    static getDragon({ dragonId }: { dragonId: number }): Promise<getDragonInfo> {
        return new Promise((resolve, reject) => {
            pool.query(
                'SELECT birthdate, nickname, "generationId" FROM dragon WHERE dragon.id = $1',
                [dragonId],
                (error, response) => {
                    if (error) return reject(error)

                    if (response.rows.length === 0) return reject(new Error('no dragon'))

                    resolve(response.rows[0])
                }
            )
        })
    }
}