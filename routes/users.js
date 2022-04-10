const express = require("express");
const UserRepo = require("../repos/users");
const router = express.Router();

router.get("/users", async function (req, res) {
  let result = await UserRepo.find();
  res.json(result);
});

router.get("/users/:id", async function (req, res) {
  const { id } = req.params;
  let user = await UserRepo.findById(id);
  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
});

router.post("/users", async function (req, res) {
  const user = await UserRepo.insert(req.body);
  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
});

router.delete("/users/:id", async function (req, res) {
  const user = await UserRepo.delete(req.params);
  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
});

module.exports = { userRoute: router };
