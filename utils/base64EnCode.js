var fs = require("fs");

function file_base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString("base64");
}
function base64_encode(bitmap) {
  return Buffer.from(bitmap).toString("base64");
}

module.exports = { base64_encode, file_base64_encode };
