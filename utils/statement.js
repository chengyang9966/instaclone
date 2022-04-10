const insertStatement = (table, params) => {
  let text = "";
  let paramsArr = Object.keys(params);
  text = `INSERT INTO ${table} `;
  text += `(${paramsArr.map((w) => {
    return `${w}`;
  })})`;
  text += ` VALUES (${paramsArr.map((w, i) => {
    return `$${i + 1}`;
  })})`;
  text += ` RETURNING * ;`;
  return text;
};

const updateStatement = (table, params, unique) => {
  let text = "";
  let paramsArr = Object.keys(params);
  text = `UPDATE ${table} SET `;
  text += `${paramsArr
    .map((w, i) => {
      return `${w} = $${i + 1}`;
    })
    .join(", ")}`;
  text += ` WHERE ${Object.keys(unique)[0]} = $${paramsArr.length + 1}`;
  text += ` RETURNING * ;`;
  return text;
};
const deleteStatement = (table, unique) => {
  let text = "";
  let paramsArr = Object.keys(unique);
  text = `DELETE FROM ${table}`;

  text += ` WHERE ${paramsArr
    .map((w, i) => {
      return `${w} = $${i + 1}`;
    })
    .join(", ")}`;
  text += ` RETURNING * ;`;

  return text;
};

module.exports = { insertStatement, updateStatement, deleteStatement };
