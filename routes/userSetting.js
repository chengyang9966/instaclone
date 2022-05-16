const express = require("express");
const { getUserSettings, updateUserSettings } = require("../repos/userSetting");
const Router = express.Router();

Router.get("/userSettings/:id", async (req, res) => {
  try {
    let result = await getUserSettings(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(400).json(error);
  }
});
Router.post("/userSettings/:user_id", async (req, res) => {
  try {
    let result = await updateUserSettings(
      { timezone: req.body.timezone },
      { user_id: req.params.user_id }
    );
    return res.json(result);
  } catch (error) {
    return res.status(400).json(error);
  }
});

module.exports = { userSettingRoute: Router };
