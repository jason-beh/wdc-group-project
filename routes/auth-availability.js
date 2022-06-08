var express = require("express");

var router = express.Router();

router.post("/get-availability", function (req, res, next) {
  var { event_id } = req.body;
  // If insufficient data, throw error
  if (!event_id) {
    return res.status(400).send("Insufficient Data");
  }
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
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

module.exports = router;
