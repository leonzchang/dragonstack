import { Router } from 'express';

import AccountTable from '../account/table';
import AccountDragonTable from '../accountDragon/table';
import Breeder from '../dargon/breeder';
import { getPublicDragons } from '../dargon/helper';
import { getDragonWithTraits } from '../dargon/helper';
import Dragon from '../dargon/index';
import DragonTable from '../dargon/table';
import { authenticatedAccount } from './helper';

const router = Router();

router.get('/new', (req, res, next) => {
  let accountId: number, dragon: Dragon;

  authenticatedAccount({ sessionString: req.cookies.sessionString })
    .then(({ account }) => {
      accountId = account.id;

      dragon = req.app.locals.engine.generation.newDragon({ accountId }); //each account only can get one dragon on each generation

      return DragonTable.storeDragon(dragon);
    })
    .then(({ dragonId }) => {
      dragon.dragonId = dragonId;

      return AccountDragonTable.storeAccountDragon({ accountId, dragonId });
    })
    .then(() => res.json({ dragon }))
    .catch((error) => next(error));
});

router.put('/update', (req, res, next) => {
  const { dragonId, nickname, isPublic, saleValue, sireValue } = req.body;

  DragonTable.updateDragon({ dragonId, nickname, isPublic, saleValue, sireValue })
    .then(() => res.json({ message: 'Successfully updated dragon' }))
    .catch((error) => next(error));
});

router.get('/public-dragons', (req, res, next) => {
  getPublicDragons()
    .then(({ dragons }) => res.json({ dragons }))
    .catch((error) => next(error));
});

router.post('/buy', (req, res, next) => {
  const { dragonId, saleValue } = req.body;
  let buyerId: number;

  DragonTable.getDragon({ dragonId })
    .then((dragon) => {
      if (dragon.saleValue !== saleValue) throw new Error('Sale value is not correct'); //validation on dragon Info

      if (!dragon.isPublic) throw new Error('Dragon must be public');

      return authenticatedAccount({ sessionString: req.cookies.sessionString }); //authenticated and get buyer account Info
    })
    .then(({ account, authenticated }) => {
      if (!authenticated) throw new Error('Unauthenticated'); //validation on buyer account Info

      if (saleValue > account.balance) throw new Error('Sale value exceeds balance'); //validation on buyer account balance

      buyerId = account.id;

      return AccountDragonTable.getDragonAccount({ dragonId });
    })
    .then(({ accountId }) => {
      if (accountId === buyerId) throw new Error('Can not buy your own dragon');

      const sellerId = accountId;

      return Promise.all([
        //process trading
        AccountTable.updateBalance({ accountId: buyerId, value: -saleValue }), //update buyer balance
        AccountTable.updateBalance({ accountId: sellerId, value: saleValue }), //update seller balance
        AccountDragonTable.updateDragonAccount({ accountId: buyerId, dragonId }), //update dragon owner
        DragonTable.updateDragon({ dragonId, isPublic: false }), //set public to false(can not trade)
      ]);
    })
    .then(() => res.json({ message: 'success!' }))
    .catch((error) => next(error));
});

router.post('/mate', (req, res, next) => {
  const { matronDragonId, patronDragonId } = req.body;

  if (matronDragonId === patronDragonId) throw new Error('Can not breed with same dragon');

  let matronDragon: Dragon, patronDragon: Dragon, patronSireValue: number;
  let matronAccountId: number, patronAccountId: number;

  getDragonWithTraits({ dragonId: patronDragonId })
    .then((dragon) => {
      if (!dragon!.isPublic) throw new Error('Dragon must be public');

      patronDragon = dragon;
      patronSireValue = dragon!.sireValue;

      return getDragonWithTraits({ dragonId: matronDragonId });
    })
    .then((dragon) => {
      matronDragon = dragon;

      return authenticatedAccount({ sessionString: req.cookies.sessionString });
    })
    .then(({ account, authenticated }) => {
      if (!authenticated) throw new Error('Unauthenticated');

      if (patronSireValue > account.balance) throw new Error('Sire value exceeds balance');

      matronAccountId = account.id;

      return AccountDragonTable.getDragonAccount({ dragonId: patronDragonId });
    })
    .then(({ accountId }) => {
      patronAccountId = accountId;

      if (matronAccountId === patronAccountId) throw new Error('Can not breed your own dragons');

      const dragon = Breeder.breederDragon({ matron: matronDragon, patron: patronDragon });

      return DragonTable.storeDragon(dragon);
    })
    .then(({ dragonId }) => {
      Promise.all([
        AccountTable.updateBalance({ accountId: matronAccountId, value: -patronSireValue }),
        AccountTable.updateBalance({ accountId: patronAccountId, value: patronSireValue }),
        AccountDragonTable.storeAccountDragon({ dragonId, accountId: matronAccountId }),
      ]);
    })
    .then(() => res.json({ message: 'Succes' }))
    .catch((error) => next(error));
});

export default router;
