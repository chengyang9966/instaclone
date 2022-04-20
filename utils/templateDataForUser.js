const { templateString } = require("./returnTemplateString");

/**
 *
 * @param string type to determinme the data to HTML
 * @param templateData object consist data from template
 * @returns html template string
 */
const getAllData = (param, { email, templateURL, roles } = templateData) => {
  let allData = {
    "{{formAction}}": "/",
    "{{title}}": "Register",
    "{{username}}": "",
    "{{email}}": email ? email : "",
    "{{password}}": "d-none",
    "{{forgetPassword}}": "/",
    "{{btnLeftLink}}": "/",
    "{{btnLeft}}": "Register",
    "{{forgetPasswordShow}}": "",
    "{{btnRightLink}}": "/",
    "{{btnRight}}": "Login",
    "{{showRole}}": "d-none",
    "{{roles}}": "",
  };
  let register_view_url =
      `${process.env.CLIENT_URL}:${process.env.PORT}/${process.env.REGISTER_VIEW_PATH}`.replace(
        "{{email}}",
        email ? email : ""
      ),
    login_view_url =
      `${process.env.CLIENT_URL}:${process.env.PORT}/${process.env.LOGIN_VIEW_PATH}`.replace(
        "{{email}}",
        email ? email : ""
      ),
    login_url = `${process.env.CLIENT_URL}:${process.env.PORT}/${process.env.LOGIN_PATH}`,
    register_url = `${process.env.CLIENT_URL}:${process.env.PORT}/${process.env.REGISTER_PATH}`,
    foget_password_view_url =
      `${process.env.CLIENT_URL}:${process.env.PORT}/${process.env.FORGET_PASSWORD_PATH}`.replace(
        "{{email}}",
        email ? email : ""
      );
  let roles_in_html = roles
    ? roles
        .map((w) => `<option value="${w.id}">${w.roleName}</option>`)
        .join(" ")
    : "";

  switch (param) {
    case "register":
      allData = Object.assign(allData, {
        "{{formAction}}": register_url,
        "{{password}}": "d-none",
        "{{forgetPasswordShow}}": "d-none",
        "{{btnLeftLink}}": login_view_url,
        "{{btnLeft}}": "Login",
        "{{btnRightLink}}": register_url,
        "{{btnRight}}": "register",
        "{{showRole}}": "",
        "{{roles}}": roles_in_html,
      });
      break;

    case "login":
      allData = Object.assign(allData, {
        "{{formAction}}": login_url,
        "{{password}}": "",
        "{{username}}": "d-none",
        "{{title}}": "login",
        "{{forgetPassword}}": foget_password_view_url,
        "{{btnLeftLink}}": register_view_url,
        "{{btnLeft}}": "register",
        "{{btnRightLink}}": login_url,
        "{{btnRight}}": "login",
      });
      break;

    case "forget_password":
      allData = Object.assign(allData, {
        "{{formAction}}": foget_password_view_url,
        "{{title}}": "Reset Password",
        "{{forgetPasswordShow}}": "d-none",
        "{{username}}": "d-none",
        "{{forgetPassword}}": foget_password_view_url,
        "{{btnLeftLink}}": login_view_url,
        "{{btnLeft}}": "login",
        "{{btnRightLink}}": foget_password_view_url,
        "{{btnRight}}": "submit",
      });
      break;

    default:
      break;
  }

  let loginHTML = templateString(templateURL);
  Object.entries(allData).map(([k, v], i) => {
    loginHTML = loginHTML.replace(new RegExp(k, "g"), v);
  });

  return loginHTML;
};

module.exports = getAllData;
