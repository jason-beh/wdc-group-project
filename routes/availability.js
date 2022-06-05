var express = require("express");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");

var router = express.Router();

router.post("/get-availability", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    var { event_id } = req.body;
    var query =
      "SELECT * from Availability INNER JOIN Proposed_Event_Time ON Availability.proposed_event_time_id = Proposed_Event_Time.proposed_event_time_id WHERE event_id = ? AND email = ?;";
    connection.query(query, [event_id, req.session.user.email], function (err, rows, fields) {
      connection.release();
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      return res.send(rows);
    });
  });
});

router.post("/specify-availability", function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An internal server error occurred.");
    }
    var { proposed_event_id, event_id } = req.body;

    if (!proposed_event_id || !event_id) {
      return res.status(400).send("Insufficient Data");
    }

    let baseQueryOptions;

    if (!userIsLoggedIn(req.session.user)) {
      if (!req.body.email) {
        return res.status(400).send("Insufficient Data");
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

// Rendering Pages
router.get("/specify-availability", function (req, res, next) {
  res.sendFile(pathToHtml("specify-availability.html"));
});

module.exports = router;
