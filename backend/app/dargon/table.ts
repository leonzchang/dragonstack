import pool from '../../databasePool';
import DragonTraitTable from '../dragonTrait/table';
import Dragon from './index';

interface getDragonInfo {
  birthdate: Date;
  nickname: string;
  generationId: number;
  saleValue: number;
  sireValue: number;
  isPublic: boolean;
}

export default class DragonTable {
  static storeDragon(dragon: Dragon) {
    const { birthdate, nickname, generationId, isPublic, saleValue, sireValue } = dragon;

    return new Promise<{ dragonId: number }>((resolve, reject) => {
      pool.query(
        'INSERT INTO dragon(birthdate, nickname, "generationId", "isPublic", "saleValue", "sireValue") VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
        [birthdate, nickname, generationId, isPublic, saleValue, sireValue],
        (error, response) => {
          if (error) return reject(error);

          const dragonId: number = response.rows[0].id;

          Promise.all(
            dragon.traits.map(({ traitType, traitValue }) => {
              return DragonTraitTable.storeDragonTrait({ dragonId, traitType, traitValue });
            })
          )
            .then(() => resolve({ dragonId }))
            .catch((error) => reject(error));
        }
      );
    });
  }

  static getDragon({ dragonId }: { dragonId: number }) {
    return new Promise<getDragonInfo>((resolve, reject) => {
      pool.query(
        'SELECT birthdate, nickname, "generationId", "isPublic", "saleValue", "sireValue" FROM dragon WHERE dragon.id = $1',
        [dragonId],
        (error, response) => {
          if (error) reject(error);

          if (response.rows.length === 0) reject(new Error('no dragon'));

          resolve(response.rows[0]);
        }
      );
    });
  }

  static updateDragon({
    dragonId,
    nickname,
    isPublic,
    saleValue,
    sireValue,
  }: {
    dragonId: number;
    nickname?: string;
    isPublic?: boolean;
    saleValue?: number;
    sireValue?: number;
  }) {
    const settingMap = { nickname, isPublic, saleValue, sireValue };

    //array of promise   //convert object to array
    const validQueries = Object.entries(settingMap).filter(([settingKey, settingValue]) => {
      if (settingValue !== undefined) {
        return new Promise<void>((resolve, reject) => {
          pool.query(
            `UPDATE dragon SET "${settingKey}" = $1 WHERE id = $2`,
            [settingValue, dragonId],
            (error) => {
              if (error) reject(error);

              resolve();
            }
          );
        });
      }
    });

    return Promise.all(validQueries);
  }
}
