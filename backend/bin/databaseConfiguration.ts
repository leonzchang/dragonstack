export default {
  user: process.env.PG_USER_NAME,
  host: process.env.PG_DB_URL,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_USER_PWD,
  port: 5432,
};
