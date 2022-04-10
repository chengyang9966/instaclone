const { Pool, Client } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  //   database: "my-db",
});

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  //   database: "my-db",
});

const connectionCheck = async (cb) => {
  let client = await pool.connect();
  let result = await client.query("SELECT NOW()");
  console.log(result.rows[0]);
  if (cb) {
    cb();
  }
};

const close = () => {
  return pool.end();
};

const query = (sql, params) => {
  return pool.query(sql, params);
};

module.exports = { client, connectionCheck, query, close };
