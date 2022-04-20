const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SEND_GRID_KEY);
const msg = {
  to: "test@example.com",
  from: "no_replyInstaClone@protonmail.com", // Use the email address or domain you verified above
  subject: "Sending with Twilio SendGrid is Fun",
  //   text: "and easy to do anywhere, even with Node.js",
  //   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};
//ES6

const sendEmail = async (value) => {
  try {
    let result = await sgMail.send(Object.assign(msg, value));

    return { ...result, status: "success" };
  } catch (error) {
    console.log(
      "🚀 ~ file: sendgridEmail.js ~ line 18 ~ sendEmail ~ error",
      error
    );
    if (error.response) {
      return { ...error.response.body, status: "failed" };
    }
    return { ...error, status: "failed" };
  }
};

module.exports = sendEmail;
