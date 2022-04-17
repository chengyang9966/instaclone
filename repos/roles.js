const pool = require("../dbConnection");
const toCamelCasing = require("../utils/camelCasing");
const {
  insertStatement,
  updateStatement,
  deleteStatement,
} = require("../utils/statement");
const moment = require("moment");

class RoleRepo {
  static async find() {
    const { rows } = await pool.query("SELECT * FROM roles ");
    let newRows = toCamelCasing(rows);
    return newRows;
  }
}
module.exports = RoleRepo;
