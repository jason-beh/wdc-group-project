var express = require("express");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");
const { validationResult, check } = require("express-validator");

var router = express.Router();

router.post("/specify-availability", function (req, res, next) {
  var { proposed_event_id, event_id } = req.body;

  if (!proposed_event_id || !event_id) {
    return res.status(400).send("Insufficient Data");
  }
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An internal server error occurred.");
    }
    // Edge case handling (Specify availability cannot be done after the event is finalized)
    var query = "select * from Events where event_id = ?;";
    connection.query(query, [event_id], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      if (!rows || rows.length === 0) {
        return res.status(405).send("The event does not exist.");
      }
      if (rows[0]["finalized_event_time_id"]) {
        return res
          .status(405)
          .send("You cannot specify availability after the event is finalized.");
      }

      let baseQueryOptions;

      if (!userIsLoggedIn(req.session.user)) {
        if (!req.body.email) {
          return res.status(400).send("Insufficient Data");
        }
        check(req.body.email).isEmail().withMessage("Email is invalid");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          let error = errors.array()[0];
          return res.status(400).send(error.msg);
        }
        baseQueryOptions = [req.body["email"]];
      } else {
        baseQueryOptions = [req.session.user.email];
      }

      // delete previous availability
      let queryOptions = [...baseQueryOptions, event_id];
      let query =
        "delete Availability from Availability inner join Proposed_Event_Time on Availability.proposed_event_time_id = Proposed_Event_Time.proposed_event_time_id where email = ? and event_id = ?;";
      connection.query(query, queryOptions, function (err, rows, fields) {
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }

        // insert new availability
        for (let index = 0; index < proposed_event_id.length; index++) {
          let queryOptions = [...baseQueryOptions, proposed_event_id[index]];
          console.log(queryOptions);
          let query = "INSERT INTO Availability VALUES (?, ?);";
          connection.query(query, queryOptions, function (err, rows, fields) {
            if (err) {
              console.log(err);
              return res.status(500).send("An interval server error occurred.");
            }
          });
        }
        connection.release();
        return res.send("Successfully in editing availability");
      });
    });
  });
});

// Rendering Pages
router.get("/specify-availability", function (req, res, next) {
  res.sendFile(pathToHtml("specify-availability.html"));
});

module.exports = router;
