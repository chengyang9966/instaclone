const path = require("path");
const fs = require("fs");

const tenplateString = (newPATH) => {
  let pathString = process.env.FOLDER_PATH
    ? `${process.env.FOLDER_PATH}/${newPATH}`
    : newPATH;
  let newPath = path.resolve(pathString);
  var verifiedUserHTML = fs.readFileSync(newPath, {
    encoding: "utf8",
  });

  return verifiedUserHTML;
};

module.exports = tenplateString;
