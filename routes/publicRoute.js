const express = require("express");
const { VerifyToken, CreateToken } = require("../middleware/token");
const UserRepo = require("../repos/users");
const router = express.Router();

const { TokenVerified } = require("../middleware/middlewareToken");
const { hashPassword, verifiedPassword } = require("../utils/password");
const moment = require("moment");
const sendEmail = require("../utils/sendEmail");
const { templateString } = require("../utils/returnTemplateString");
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

    let createUserToken = CreateToken(
      {
        email: user.email,
        id: user.id,
        username: user.username,
      },
      process.env.DEFAULT_PASSWORD
    );

    const link = `${process.env.CLIENT_URL}:${process.env.PORT}/userVerified?token=${createUserToken}&id=${user.id}`,
      createUserHTML = templateString("template/createUser.html")
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

    let user = await UserRepo.findById(id);
    if (!user) return res.status(404).send({ msg: "invalid User" });

    let isVerifedToken = VerifyToken(token, user.password);
    if (!isVerifedToken || isVerifedToken.valid === false)
      return res.status(404).send({ msg: "Link is expired" });

    let newToken = CreateToken({ id, username: user.username });
    html = templateString("template/insertPassword.html")
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
    console.log("🚀 ~ file: publicRoute.js ~ line 173 ~ user", user);
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
    let newURL =
      `${process.env.CLIENT_URL}:${process.env.PORT}/${process.env.LOGIN_VIEW_PATH}`.replace(
        "{{email}}",
        user.email ? user.email : ""
      );
    resetPasswordSuccessHTML = templateString(
      "template/resetPasswordSuccess.html"
    )
      .replace("{{username}}", user.username)
      .replace("{{urlLogin}}", newURL);

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

router.get("/userVerified", TokenVerified, async function (req, res) {
  try {
    const { token, id } = req.query;
    if (!token || !id || id === "undefined")
      return res.status(404).send({ msg: "invalid query" });

    let user = await UserRepo.findById(id);
    console.log("🚀 ~ file: publicRoute.js ~ line 216 ~ user", user);

    if (!user) {
      return res.status(404).send({ msg: "invalid User" });
    }

    if (user.status === "active") {
      let newURL =
        `${process.env.CLIENT_URL}:${process.env.PORT}/${process.env.LOGIN_VIEW_PATH}`.replace(
          "{{email}}",
          user.email ? user.email : ""
        );
      res.redirect(newURL);
      return res.end();
    }
    let body = { status: "active" };

    let userUpdate = await UserRepo.update({ id }, body);
    if (!userUpdate) {
      return res.status(404).send({ msg: "Update Failed" });
    }

    verifiedUserHTML = templateString("template/verifiedUser.html")
      .replace("{{username}}", user.username)
      .replace(
        "{{url}}",
        `${process.env.CLIENT_URL}:${process.env.PORT}/${process.env.LOGIN_VIEW_PATH}`
      )
      .replace("{{email}}", user.email)
      .replace("{{DEFAULT_PASSWORD}}", process.env.DEFAULT_PASSWORD);

    res.writeHead(200, {
      "Content-Type": "text/html",
    });
    res.write(verifiedUserHTML);
    return res.end();
  } catch (error) {
    return res.status(404).send({ ...error, msg: "Update Failed" });
  }
});

router.post("/forgetpassword", async function (req, res) {
  if (!req.body.email) {
    return res.status(404).send({ msg: "email is required" });
  }
  let user = await UserRepo.findBy({ email: req.body.email });
  if (!user) {
    throw new Error("User does not exist");
  }

  let resetToken = CreateToken(
    {
      email: user.email,
      id: user.id,
      username: user.username,
    },
    user.password
  );

  const link = `${process.env.CLIENT_URL}:${process.env.PORT}/passwordReset?token=${resetToken}&id=${user.id}`;

  resetPasswordHTML = templateString("template/resetPassword.html").replace(
    "javascript:void(0);",
    link
  );
  let result = await sendEmail({
    to: user.email,
    subject: "Reset Pasword",
    html: resetPasswordHTML,
  });
  if (!result || result.status === "failed")
    return res.status(404).send({ msg: "Fail to send Email" });

  return res.send({
    data: result,
    msg: `Send Email to ${user.username} successfully`,
  });
});

module.exports = router;
