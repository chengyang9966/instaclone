const express = require("express");
const UserRepo = require("../repos/users");
const router = express.Router();

router.get("/tester", async function (req, res) {
  let result = await UserRepo.find();
  res.send(result);
});

module.exports = { testRoute: router };
