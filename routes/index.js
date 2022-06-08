var express = require("express");
var router = express.Router();

const { pathToHtml } = require("../utils/routes");

// Rendering Pages
router.get("/", function (req, res, next) {
  res.sendFile(pathToHtml("index.html"));
});

router.get("/404", function (req, res, next) {
  res.sendFile(pathToHtml("404.html"));
});

module.exports = router;
