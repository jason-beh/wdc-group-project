var express = require("express");
var router = express.Router();

var path = require("path");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");

// Rendering Pages
router.get("/", function (req, res, next) {
  res.sendFile(pathToHtml("index.html"));
});

router.get("/my-events", function (req, res, next) {
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }

  res.sendFile(pathToHtml("my-events.html"));
});

module.exports = router;
