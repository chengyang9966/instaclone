var express = require("express");
const cors = require("cors");
require("dotenv").config();

var app = express();
var { connectionCheck } = require("./dbConnection");

const {
  TokenVerified,
  addHeaderAuth,
} = require("./middleware/middlewareToken");

const { userRoute } = require("./routes/users");
const { msgRoute } = require("./routes/messages");
const addPsswordHeader = require("./middleware/addPassword");
const { userSettingRoute } = require("./routes/userSetting");
app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);
app.use(express.static("public"));
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:8888"],
  })
);
app.use(express.json());
// access for Public
app.use(
  "/",
  express.urlencoded({ extended: false }),
  require("./routes/publicRoute")
);
// JWT Token Added
app.use(
  "/api",
  addPsswordHeader,
  TokenVerified,
  userRoute,
  msgRoute,
  userSettingRoute
);

// Dowload file
app.use(require("./routes/files"));
app.use("/invoices", TokenVerified, require("./routes/invoice"));

app.get("/", async function (req, res) {
  res.send("<h5>qweqwe</h5>");
});
// app.use(compress());

const SetupPort = () =>
  app.listen(process.env.PORT, function () {
    console.log("App listening at http://localhost:%s", process.env.PORT);
  });

connectionCheck(SetupPort);
