const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // generated ethereal user
    pass: process.env.EMAIL_PASSWORD, // generated ethereal password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (value) => {
  let defaultOption = {
    from: "no_replyInstaClone@protonmail.com", // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    // text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  };
  try {
    let result = await transporter.sendMail(
      Object.assign(defaultOption, value)
    );
    if (result) {
      return { ...result, status: "succes" };
    }
  } catch (error) {
    return { ...error, status: "failed" };
  }
};

module.exports = sendEmail;
