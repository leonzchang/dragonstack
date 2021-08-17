import pool from '../../databasePool';

interface traitInfo {
  traitType: string;
  traitValue: string;
}

export default class TraitTable {
  static getTraitId({ traitType, traitValue }: traitInfo): Promise<{ traitId: number }> {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id FROM trait WHERE "traitType" = $1 AND "traitValue" = $2',
        [traitType, traitValue],
        (error, response) => {
          if (error) reject(error);

          resolve({ traitId: response.rows[0].id });
        }
      );
    });
  }
}
