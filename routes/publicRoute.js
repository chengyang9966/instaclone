const express = require("express");
const { VerifyToken, CreateToken } = require("../middleware/token");
const UserRepo = require("../repos/users");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { TokenVerified } = require("../middleware/middlewareToken");
const { hashPassword, verifiedPassword } = require("../utils/password");
const moment = require("moment");
const sendEmail = require("../utils/sendEmail");

router.post("/login", async function (req, res) {
  try {
    if (!req.body.password || !req.body.email) {
      return res.status(404).send({ msg: "password is required" });
    }
    let user = await UserRepo.findBy({ email: req.body.email });
    const { id, password, salt } = user;
    if (user) {
      let newPassword = await verifiedPassword(
        req.body.password,
        password,
        salt
      );
      if (newPassword) {
        user = await UserRepo.update(
          { id },
          {
            last_login: moment().format(process.env.TIMESTAP_FORMAT),
          }
        );
        delete user.password;
        delete user.salt;
        delete user.lastLogin;
        return res.send({ ...user, msg: "User login success", login: true });
      }
      return res.status(404).send({ msg: "User fail to login", login: false });
    }
  } catch (error) {
    res.status(404).send({ ...error, msg: "Failed Login" });
  }
});

router.get("/passwordReset", async function (req, res) {
  try {
    const { token, id } = req.query;
    if (!token || !id || id === "undefined")
      return res.status(404).send({ msg: "invalid query" });

    // let isVerifedToken = VerifyToken(token);
    // if (!isVerifedToken || isVerifedToken.valid === false)
    //   return res.status(404).send({ msg: "invalid Token" });

    let user = await UserRepo.findById(id);
    if (!user) {
      return res.status(404).send({ msg: "invalid User" });
    }
    let html = await fs.readFileSync(
      path.resolve("template/insertPassword.html"),
      { encoding: "utf8" }
    );
    let newToken = CreateToken({ id, username: user.username });
    html = html
      .replace("{{username}}", user.username)
      .replace("<Authorization>", `Basic ${newToken}`);

    return res.send(html);
  } catch (error) {
    return res.status(404).send({ ...error, msg: "Password Reset Error" });
  }
});

router.post("/passwordReset", TokenVerified, async function (req, res) {
  try {
    const { pasword, confirmpasword } = req.body;
    const { id } = req.authData;

    if (!pasword || !confirmpasword) {
      return res.status(404).send({ msg: "Param is required " });
    }
    let user = await UserRepo.findById(id);
    if (!user) {
      return res.status(404).send({ msg: "invalid User" });
    }
    let body = {};
    if (pasword) {
      let newPassword = await hashPassword(pasword);
      body.password = newPassword.hashPassword;
      body.salt = newPassword.salt;
    }

    let userUpdate = await UserRepo.update({ id }, body);

    if (!userUpdate) {
      return res.status(404).send({ msg: "Update Failed" });
    }
    let newPath = path.resolve("template/resetPasswordSuccess.html");
    var resetPasswordSuccessHTML = await fs.readFileSync(newPath, {
      encoding: "utf8",
    });
    resetPasswordSuccessHTML = resetPasswordSuccessHTML.replace(
      "{{username}}",
      user.username
    );

    let result = await sendEmail({
      to: user.email,
      subject: "Reset Pasword Successfully",
      html: resetPasswordSuccessHTML,
    });

    return res.send({
      ...userUpdate,
      ...result,
      msg: "Update Password SuccessFully",
    });
  } catch (error) {
    return res.status(404).send({ ...error, msg: "Update Failed" });
  }
});
module.exports = router;
