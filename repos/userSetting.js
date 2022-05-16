const pool = require("../dbConnection");
const toCamelCasing = require("../utils/camelCasing");
const {
  insertStatement,
  updateStatement,
  deleteStatement,
} = require("../utils/statement");
const moment = require("moment");

class UerSettingsRepo {
  static async getUserSettings(id) {
    const { rows } = await pool.query(
      `SELECT * FROM user_settings WHERE user_id=$1;`,
      [id]
    );
    let newRows = toCamelCasing(rows);
    return newRows[0];
  }
  static async updateUserSettings(params, unique) {
    const statement = updateStatement("user_settings", params, unique);

    let allParams = [
      ...Object.values(params),
      ...Object.values(unique),
      moment().format(process.env.TIMESTAP_FORMAT),
    ];

    const { rows } = await pool.query(statement, allParams);
    return toCamelCasing(rows)[0];
  }
}

module.exports = UerSettingsRepo;
