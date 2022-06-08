var express = require("express");
const { pathToHtml } = require("../utils/routes");

var router = express.Router();

router.get("/search", function (req, res, next) {
  let { q } = req.query;

  if (!q) {
    return res.send([]);
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      return next(err);
    }

    let splitQuery = q.split("'");
    let parsedQuery = splitQuery.join("\\'");

    var query = `SELECT * from Events WHERE title LIKE '%${parsedQuery}%'`;
    connection.query(query, function (err, rows, fields) {
      connection.release();
      if (err) {
        return next(err);
      }
      return res.send(rows);
    });
  });
});

router.post("/search", function (req, res, next) {
  return res.redirect(`/search-results?q=${req.body.query}`);
});

// Rendering Pages
router.get("/search-results", function (req, res, next) {
  res.sendFile(pathToHtml("search-results.html"));
});

module.exports = router;
