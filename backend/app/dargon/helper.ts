import pool from '../../databasePool';
import Dragon from './index';
import DragonTable from './table';

interface traitsType {
  traitType: string;
  traitValue: string;
}

const getDragonWithTraits = ({ dragonId }: { dragonId: number }) => {
  return Promise.all([
    DragonTable.getDragon({ dragonId }),
    new Promise<Array<traitsType>>((resolve, reject) => {
      pool.query(
        `SELECT "traitType", "traitValue" 
                FROM trait 
                INNER JOIN dragonTrait ON trait.id = dragonTrait."traitId"
                WHERE dragonTrait."dragonId" = $1`,
        [dragonId],
        (error, response) => {
          if (error) reject(error);

          resolve(response.rows);
        }
      );
    }),
  ])
    .then(([dragon, dragonTraits]) => {
      return new Dragon({
        ...dragon,
        dragonId,
        traits: dragonTraits,
      });
    })
    .catch((error) => {
      throw error;
    });
};

const getPublicDragons = () => {
  return new Promise<{ dragons: (void | Dragon)[] }>((resolve, reject) => {
    pool.query('SELECT id FROM dragon WHERE "isPublic" = True', (error, response) => {
      if (error) return reject(error);

      const publicDragonRows = response.rows;

      Promise.all(publicDragonRows.map(({ id }) => getDragonWithTraits({ dragonId: id })))
        .then((dragons) => resolve({ dragons }))
        .catch((error) => reject(error));
    });
  });
};

export { getDragonWithTraits, getPublicDragons };
