import knex, { Knex } from 'knex';
import config from '../../config';

const db: Knex = knex({
  client: 'pg',
  connection: {
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    user: config.db.user,
    password: config.db.password,
  },
  pool: {
    min: config.db.poolMin,
    max: config.db.poolMax,
  },
});

export default db;
