const express = require("express");
const UserRepo = require("../repos/users");
const moment = require("moment");
const { hashPassword, verifiedPassword } = require("../utils/password");
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
    return res.sendStatus(404);
  }
});

router.post("/users", async function (req, res) {
  if (!req.body.password) {
    return res.status(404).send({ msg: "password is required" });
  }

  let newPassword = await hashPassword(req.body.password);
  req.body.password = newPassword.hashPassword;
  req.body.salt = newPassword.salt;
  const user = await UserRepo.insert(req.body);
  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
});
router.post("/login", async function (req, res) {
  if (!req.body.password || !req.body.email) {
    return res.status(404).send({ msg: "password is required" });
  }
  let user = await UserRepo.findBy({ email: req.body.email });
  const { id, password, salt } = user;
  if (user) {
    let newPassword = await verifiedPassword(req.body.password, password, salt);
    if (newPassword) {
      user = await UserRepo.update(
        { id },
        {
          last_login: moment().format("YYYY-MM-DD HH:mm:ss"),
        }
      );
      delete user.password;
      delete user.salt;
      delete user.lastLogin;
      return res.send({ ...user, msg: "User login success", login: true });
    }
    return res.send({ msg: "User fail to login", login: false });
  } else {
    res.sendStatus(404);
  }
});

router.put("/users/:id", async function (req, res) {
  if (req.body.password) {
    let newPassword = await hashPassword(req.body.password);
    req.body.password = newPassword.hashPassword;
    req.body.salt = newPassword.salt;
  }

  const user = await UserRepo.update(req.params, req.body);

  if (user) {
    res.send(user);
  } else {
    return res.sendStatus(404);
  }
});

router.delete("/users/:id", async function (req, res) {
  const user = await UserRepo.delete(req.params);
  if (user) {
    res.send(user);
  } else {
    return res.sendStatus(404);
  }
});

module.exports = { userRoute: router };
