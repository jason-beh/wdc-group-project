var express = require("express");
const { body, validationResult, check } = require("express-validator");

var router = express.Router();

router.get(
  "/confirm-attendance",
  check("email").isEmail().withMessage("Email is invalid"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.array()[0];
      return res.status(400).send(error.msg);
    }

    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        return res.status(500).send("An interval server error occurred.");
      }
      var { email, event_id } = req.query;
      if (!email || !event_id) {
        connection.release();
        return res.status(500).send("Insufficient Data");
      }
      // Edge case handling (Confirm attendance cannot be done before the event is finalized)
      var query = "select * from Events where event_id = ?;";
      connection.query(query, [event_id], function (err, rows, fields) {
        if (err) {
          connection.release();
          return res.status(500).send("An interval server error occurred.");
        }

        if (!rows || rows.length === 0) {
          connection.release();
          return res.status(405).send("The event does not exist.");
        }
        if (!rows[0]["finalized_event_time_id"]) {
          connection.release();
          return res
            .status(405)
            .send("You cannot confirm attendance before the event is finalized.");
        }
        query = "SELECT * from Attendance where email = ? and event_id = ?;";
        connection.query(query, [email, event_id], function (err, rows, fields) {
          if (err) {
            connection.release();
            return res.status(500).send("An interval server error occurred.");
          }

          if (rows && rows.length > 0) {
            connection.release();
            return res.status(500).send("Availability has been previously specified");
          }

          query = "insert into Attendance values (?, ?);";
          connection.query(query, [email, event_id], function (err, rows, fields) {
            connection.release();
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }

            return res.redirect("/");
          });
        });
      });
    });
  }
);

module.exports = router;
