const jwt = require("jsonwebtoken");

const CreateToken = (data, TOKEN_SECRET) => {
  return jwt.sign(
    data,
    TOKEN_SECRET ? TOKEN_SECRET : process.env.TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

const VerifyToken = (token, TOKEN_SECRET) => {
  return jwt.verify(
    token,
    TOKEN_SECRET ? TOKEN_SECRET : process.env.TOKEN_SECRET,
    (err, decode) => {
      if (err) {
        return { ...err, valid: false };
      } else {
        return { ...decode, valid: true };
      }
    }
  );
};

module.exports = {
  CreateToken,
  VerifyToken,
};
