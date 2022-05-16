const addPsswordHeader = function (req, res, next) {
  if (req.headers["password"]) {
    res.locals.AUTH_CODE = req.headers["password"];
  }
  next();
};
module.exports = addPsswordHeader;
