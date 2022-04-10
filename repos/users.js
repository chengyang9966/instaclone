const pool = require("../dbConnection");
const toCamelCasing = require("../utils/camelCasing");
const {
  insertStatement,
  updateStatement,
  deleteStatement,
} = require("../utils/statement");

class UersRepo {
  static async find() {
    const { rows } = await pool.query("SELECT * FROM users");
    let newRows = toCamelCasing(rows);
    return newRows;
  }
  static async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1;`, [id]);
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
