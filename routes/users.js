const express = require("express");
const UserRepo = require("../repos/users");
const { hashPassword } = require("../utils/password");
const { CreateToken } = require("../middleware/token");
const sendEmail = require("../utils/sendEmail");
var fs = require("fs");
const path = require("path");
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
    returnres.status(404);
  }
});

router.post("/users", async function (req, res) {
  if (req.body.password) {
    let newPassword = await hashPassword(req.body.password);
    req.body.password = newPassword.hashPassword;
    req.body.salt = newPassword.salt;
  }
  const user = await UserRepo.insert({ ...req.body, status: "pending" });

  if (!user) return res.status(404).send({ msg: "Fail to create User" });

  let createUserToken = CreateToken({
    email: user.email,
    id: user.id,
    username: user.username,
  });

  const link = `${process.env.CLIENT_URL}/userVerified?token=${createUserToken}&id=${user.id}`;

  let newPath = path.resolve("template/createUser.html");
  var createUserHTML = fs.readFileSync(newPath, { encoding: "utf8" });
  createUserHTML = createUserHTML
    .replace(/{{url}}/g, link)
    .replace("{{username}}", user.username);

  let result = await sendEmail({
    to: user.email,
    subject: "Verified User",
    html: createUserHTML,
  });

  console.log("🚀 ~ file: users.js ~ line 57 ~ result", result);
  if (!result || result.status === "failed")
    return res.status(404).send({ msg: "Fail to send Email" });

  return res.send({ ...user, msg: "Create User successfully" });
});

router.post("/forgetpassword", async function (req, res) {
  if (!req.body.email) {
    return res.status(404).send({ msg: "email is required" });
  }
  let user = await UserRepo.findBy({ email: req.body.email });
  if (!user) {
    throw new Error("User does not exist");
  }

  let resetToken = CreateToken({
    email: user.email,
    id: user.id,
    username: user.username,
  });

  const link = `${process.env.CLIENT_URL}/passwordReset?token=${resetToken}&id=${user.id}`;

  let newPath = path.resolve("template/resetPassword.html");
  var resetPasswordHTML = await fs.readFileSync(newPath, { encoding: "utf8" });

  resetPasswordHTML = resetPasswordHTML.replace("javascript:void(0);", link);
  let result = await sendEmail({
    to: user.email,
    subject: "Reset Pasword",
    html: resetPasswordHTML,
  });
  if (!result || result.status === "failed")
    return res.status(404).send({ msg: "Fail to send Email" });

  return res.send({
    data: result,
    msg: `Send Email to ${username} successfully`,
  });
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
    returnres.status(404);
  }
});

router.delete("/users/:id", async function (req, res) {
  const user = await UserRepo.delete(req.params);
  if (user) {
    res.send(user);
  } else {
    returnres.status(404);
  }
});

module.exports = { userRoute: router };
