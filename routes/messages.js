const express = require("express");
const MessageRepo = require("../repos/messages");
const Router = express.Router();

Router.get("/msg/:id", async (req, res) => {
  let result = await MessageRepo.getListMsg(req.params.id);
  return res.json(result);
});

module.exports = { msgRoute: Router };
