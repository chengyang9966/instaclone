const jwt = require("jsonwebtoken");

const CreateToken = (data) => {
  return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: "1h" });
};

const VerifyToken = (token) => {
  return jwt.verify(token, process.env.TOKEN_SECRET, (err, decode) => {
    if (err) {
      return { ...err, valid: false };
    } else {
      return { ...decode, valid: true };
    }
  });
};

module.exports = {
  CreateToken,
  VerifyToken,
};
