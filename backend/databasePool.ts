import { Pool } from 'pg';

import databaseConfiguration from './secrets/databaseConfiguration';

const pool = new Pool(databaseConfiguration);

export default pool;
