var express = require("express");
var db = require("../utils/db");

var router = express.Router();

router.get("/confirm-attendance", function (req, res, next) {
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    var { email, event_id } = req.query;
    if (!email || !event_id) {
      return res.status(500).send("An interval server error occurred.");
    }
    var query = "SELECT * from Attendance where email = ? and event_id = ?;";
    connection.query(query, [email, event_id], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      if (rows && rows.length > 0) {
        return res.status(200).end();
      }
      query = "insert into Attendance values (?, ?);";
      connection.query(query, [email, event_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        return res.status(200).end();
      });
    });
  });
});

module.exports = router;
