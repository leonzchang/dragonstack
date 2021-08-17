import pool from '../../databasePool';
import Generation from './index';

export default class GenerationTable {
  static storeGeneration(generation: Generation): Promise<{ generationId: number }> {
    return new Promise((resolve, reject) => {
      pool.query(
        'INSERT INTO generation(expiration) VALUES($1) RETURNING id ',
        [generation.expiration],
        (error, response) => {
          if (error) return reject(error);

          const generationId: number = response.rows[0].id;

          resolve({ generationId });
        }
      );
    });
  }
}
