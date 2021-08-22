import { Pool } from 'pg';

import databaseConfiguration from './bin/databaseConfiguration';

const pool = new Pool(databaseConfiguration);

export default pool;
