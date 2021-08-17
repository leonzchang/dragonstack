import pool from '../../databasePool';
import TraitTable from '../trait/table';

interface storeInfo {
  dragonId: number;
  traitType: string;
  traitValue: string;
}

export default class DragonTraitTable {
  static storeDragonTrait({ dragonId, traitType, traitValue }: storeInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      TraitTable.getTraitId({ traitType, traitValue }).then(({ traitId }) => {
        pool.query(
          'INSERT INTO dragonTrait("traitId","dragonId") VALUES($1, $2)',
          [traitId, dragonId],
          (error) => {
            if (error) return reject(error);

            resolve();
          }
        );
      });
    });
  }
}
