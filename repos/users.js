const pool = require("../dbConnection");
const toCamelCasing = require("../utils/camelCasing");
const {
  insertStatement,
  updateStatement,
  deleteStatement,
} = require("../utils/statement");
const moment = require("moment");

class UersRepo {
  static async find() {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE status='active'"
    );
    let newRows = toCamelCasing(rows);
    return newRows;
  }
  static async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1;`, [id]);
    let newRows = toCamelCasing(rows);
    return newRows[0];
  }
  static async findBy(params) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE ${Object.keys(params)[0]}=$1;`,
      Object.values(params)
    );
    let newRows = toCamelCasing(rows);
    return newRows[0];
  }
  static async insert(params) {
    let text = insertStatement("users", params);

    const { rows } = await pool.query(text, Object.values(params));

    return toCamelCasing(rows)[0];
  }
  static async update(unique, params) {
    let text = updateStatement("users", params, unique);
    const { rows } = await pool.query(text, [
      ...Object.values(params),
      ...Object.values(unique),
      moment().format(process.env.TIMESTAP_FORMAT),
    ]);

    return toCamelCasing(rows)[0];
  }
  static async delete(params) {
    let text = deleteStatement("users", params);

    const { rows } = await pool.query(text, Object.values(params));

    return toCamelCasing(rows)[0];
  }
}

module.exports = UersRepo;
