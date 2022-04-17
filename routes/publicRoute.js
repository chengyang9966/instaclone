const express = require("express");
const { VerifyToken, CreateToken } = require("../middleware/token");
const UserRepo = require("../repos/users");
const router = express.Router();

const { TokenVerified } = require("../middleware/middlewareToken");
const { hashPassword, verifiedPassword } = require("../utils/password");
const moment = require("moment");
const sendEmail = require("../utils/sendEmail");
const tenplateString = require("../utils/returnTemplateString");
const getAllData = require("../utils/templateDataForUser");
const RoleRepo = require("../repos/roles");

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

router.post("/createUser", async function (req, res) {
  try {
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

    const link = `${process.env.CLIENT_URL}/userVerified?token=${createUserToken}&id=${user.id}`,
      createUserHTML = tenplateString("template/createUser.html")
        .replace(/{{url}}/g, link)
        .replace("{{username}}", user.username);

    let result = await sendEmail({
      to: user.email,
      subject: "Verified User",
      html: createUserHTML,
    });

    if (!result || result.status === "failed")
      return res.status(404).send({ msg: "Fail to send Email" });

    return res.send({ ...user, msg: "Create User successfully" });
  } catch (error) {
    console.log("🚀 ~ file: publicRoute.js ~ line 81 ~ error", error);
    return res.status(404).send({ ...error, msg: "Fail to send Email" });
  }
});

router.get("roles", async function (req, res) {});
router.get("/userForgetPassword", async function (req, res) {
  let emailText = "";
  if (Object.keys(req.query).length) {
    emailText = req.query ? req.query.email : "";
  }
  let loginHTML = getAllData("forget_password", {
    email: emailText,
    templateURL: "template/userLogin.html",
  });

  res.writeHead(200, {
    "Content-Type": "text/html",
  });
  res.write(loginHTML);
  return res.end();
});
router.get("/userLogin", async function (req, res) {
  let emailText = "";
  if (Object.keys(req.query).length) {
    emailText = req.query ? req.query.email : req.params ? req.params : "";
  }
  let loginHTML = getAllData("login", {
    email: emailText,
    templateURL: "template/userLogin.html",
  });

  res.writeHead(200, {
    "Content-Type": "text/html",
  });
  res.write(loginHTML);
  return res.end();
});

router.get("/userRegister", async function (req, res) {
  let emailText = "";
  if (Object.keys(req.query).length) {
    emailText = req.query ? req.query.email : "";
  }
  let allRoles = await RoleRepo.find();

  let loginHTML = getAllData("register", {
    email: emailText,
    templateURL: "template/userLogin.html",
    roles: [...allRoles, { id: 2, roleName: "abcd" }],
  });

  res.writeHead(200, {
    "Content-Type": "text/html",
  });
  res.write(loginHTML);
  return res.end();
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

    let newToken = CreateToken({ id, username: user.username });
    html = tenplateString("template/insertPassword.html")
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

    resetPasswordSuccessHTML = tenplateString(
      "template/resetPasswordSuccess.html"
    ).replace("{{username}}", user.username);

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

router.get("/userVerified", async function (req, res) {
  try {
    const { token, id } = req.query;
    if (!token || !id || id === "undefined")
      return res.status(404).send({ msg: "invalid query" });

    let user = await UserRepo.findById(id);
    console.log("🚀 ~ file: publicRoute.js ~ line 217 ~ user", user);

    if (!user) {
      return res.status(404).send({ msg: "invalid User" });
    }
    verifiedUserHTML = tenplateString("template/verifiedUser.html")
      .replace("{{username}}", user.username)
      .replace(
        "{{url}}",
        `${process.env.CLIENT_URL}/${process.env.LOGIN_VIEW_PATH}`
      )
      .replace("{{email}}", user.email)
      .replace("{{DEFAULT_PASSWORD}}", process.env.DEFAULT_PASSWORD);

    if (user.status === "active") {
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      res.write(verifiedUserHTML);
      return res.end();
    }

    let isVerifedToken = VerifyToken(token);

    if (!isVerifedToken || isVerifedToken.valid === false)
      return res.status(404).send({ msg: "invalid Token" });

    let body = { status: "active" };

    let userUpdate = await UserRepo.update({ id }, body);

    if (!userUpdate) {
      return res.status(404).send({ msg: "Update Failed" });
    }

    // let result = await sendEmail({
    //   to: user.email,
    //   subject: "Reset Pasword Successfully",
    //   html: resetPasswordSuccessHTML,
    // });
    res.writeHead(200, {
      "Content-Type": "text/html",
    });
    res.write(verifiedUserHTML);
    return res.end();
  } catch (error) {
    return res.status(404).send({ ...error, msg: "Update Failed" });
  }
});

module.exports = router;
