const path = require("path");
const fs = require("fs");

const tenplateString = (newPATH) => {
  let newPath = path.resolve(newPATH);
  var verifiedUserHTML = fs.readFileSync(newPath, {
    encoding: "utf8",
  });

  return verifiedUserHTML;
};

module.exports = tenplateString;
