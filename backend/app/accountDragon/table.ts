import pool from '../../databasePool';

interface storeAccountDragonInfo {
  accountId: number;
  dragonId: number;
}

interface getAccountDragonInfo {
  accountId: number;
}

interface getAccountDragonReturnType {
  accountDragons: Array<{ dragonId: number }>;
}

export default class AccountDragonTable {
  static storeAccountDragon({ accountId, dragonId }: storeAccountDragonInfo) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO accountDragon("accountId","dragonId") VALUES($1,$2)',
        [accountId, dragonId],
        (error) => {
          if (error) return reject(error);

          resolve();
        }
      );
    });
  }

  static getAccountDragon({ accountId }: getAccountDragonInfo) {
    return new Promise<getAccountDragonReturnType>((resolve, reject) => {
      pool.query(
        'SELECT "dragonId" FROM accountDragon where "accountId" = $1',
        [accountId],
        (error, response) => {
          if (error) return reject(error);

          resolve({ accountDragons: response.rows });
        }
      );
    });
  }

  static getDragonAccount({ dragonId }: { dragonId: number }) {
    return new Promise<{ accountId: number }>((resolve, reject) => {
      pool.query(
        'SELECT "accountId" FROM accountDragon WHERE "dragonId" = $1',
        [dragonId],
        (error, response) => {
          if (error) return reject(error);

          resolve({ accountId: response.rows[0].accountId });
        }
      );
    });
  }

  static updateDragonAccount({ dragonId, accountId }: { dragonId: number; accountId: number }) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'UPDATE accountDragon SET "accountId" = $1 WHERE "dragonId" = $2',
        [accountId, dragonId],
        (error) => {
          if (error) return reject(error);

          resolve();
        }
      );
    });
  }
}
