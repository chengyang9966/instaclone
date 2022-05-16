const pool = require("../dbConnection");
const toCamelCasing = require("../utils/camelCasing");
const {
  insertStatement,
  updateStatement,
  deleteStatement,
} = require("../utils/statement");

class MessageRepo {
  static async getListMsg(id) {
    const { rows } = await pool.query(
      `SELECT * FROM messages WHERE user_id=$1 ORDER BY id DESC LIMIT 10;`,
      [id]
    );
    let newRows = toCamelCasing(rows);
    return newRows;
  }
}

module.exports = MessageRepo;
