const crypto = require("crypto");

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  let hashPassword = await crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);

  return {
    hashPassword,
    salt,
  };
};

const verifiedPassword = async (password, hashPassword, salt) => {
  let newHashPassword = await crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);

  return newHashPassword === hashPassword;
};

module.exports = { hashPassword, verifiedPassword };
