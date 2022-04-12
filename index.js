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
const { testRoute } = require("./routes/test");
const publicRouteController = require("./routes/publicRoute");

app.use(cors());
app.use(express.json());

app.use("/api", addHeaderAuth, TokenVerified, userRoute, testRoute);
app.use("/", express.urlencoded({ extended: false }), publicRouteController);
app.get("/", addHeaderAuth, TokenVerified, async function (req, res) {
  res.send("<h5>qweqwe</h5>");
});

const SetupPort = () =>
  app.listen(process.env.PORT, function () {
    console.log("App listening at http://localhost:%s", process.env.PORT);
  });

connectionCheck(SetupPort);
