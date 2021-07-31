import { Router } from 'express'
import Dragon from '../dargon/index'
import DragonTable from '../dargon/table'
import { authenticatedAccount } from './helper'
import AccountDragonTable from '../accountDragon/table'

const router = Router()

router.get('/new', (req, res, next) => {
    let accountId:number , dragon:Dragon

    authenticatedAccount({ sessionString: req.cookies.sessionString })
    .then(({account})=>{
        accountId = account.id

        dragon = req.app.locals.engine.generation.newDragon()

        return DragonTable.storeDragon(dragon)
    })
    .then(({ dragonId }) => {
        dragon.dragonId = dragonId

        return AccountDragonTable.storeAccountDragon({accountId, dragonId})
        
      
    })
    .then(()  =>  res.json({ dragon }))
    .catch(error => next(error))
})

export default router
