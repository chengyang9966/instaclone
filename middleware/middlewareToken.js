const { VerifyToken, CreateToken } = require("./token");

const TokenVerified = (req, res, next) => {
  var token = null,
    customKEY = null;
  if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
    token = req.body.Authorization
      ? req.body.Authorization.split(" ")[1]
      : null;
  } else if (req.query && req.query["token"]) {
    token = req.query["token"];
    customKEY = process.env.DEFAULT_PASSWORD;
  } else {
    token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : req.headers.Authorization
      ? req.headers.Authorization.split(" ")[1]
      : null;
  }

  // let req.header

  if (!token) {
    return res.status(401).send({ message: "Unauthorize user" });
  }
  let verify = VerifyToken(token, customKEY);
  console.log("🚀 ~ file: ~ verify", verify);

  if (!verify.valid) {
    return res.status(401).send({ message: "Invalid Token" });
  } else {
    req.authData = verify;
    next();
  }
};

const addHeaderAuth = (req, res, next) => {
  let token = CreateToken({ name: "Cheng Yang", age: 23 });

  //   token =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpsVCJ9.eyJuYW1lIjoiQ2hlbmcgWWFuZyIsImFnZSI6MjMsImlhdCI6MTY0OTU4NDQzNSwiZXhwIjoxNjQ5NTg4MDM1fQ._LMeaktVkr9xZSkcIdeu_IvJ2ae_CGGSAtWrPcF1MhY";

  req.headers["Authorization"] = `Basic ${token}`;
  // res.setHeader("Authorization", `Basic ${token}`);
  // VerifyToken
  next();
};

module.exports = { addHeaderAuth, TokenVerified };
