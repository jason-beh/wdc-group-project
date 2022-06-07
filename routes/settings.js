var express = require("express");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");

var router = express.Router();

router.get("/get-settings", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }

    // Query the database
    var query = "SELECT * from Notifications_Setting WHERE email = ?";
    connection.query(query, [req.session.user.email], function (err, rows, fields) {
      connection.release();
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }

      if (rows && rows.length === 0) {
        return res.send([]);
      }

      return res.send(rows[0]);
    });
  });
});

router.put("/edit-settings", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }

  let { is_event_cancelled, is_availability_confirmed, is_event_finalised } = req.body;
  if (
    is_event_cancelled === null ||
    is_availability_confirmed === null ||
    is_event_finalised === null
  ) {
    return res.status(400).send("Insufficient Data");
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query =
      "UPDATE Notifications_Setting set is_event_cancelled = ?, is_availability_confirmed = ?, is_event_finalised = ? WHERE email = ?";
    connection.query(
      query,
      [is_event_cancelled, is_availability_confirmed, is_event_finalised, req.session.user.email],
      function (err, rows, fields) {
        connection.release();
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }

        return res.status(200).end();
      }
    );
  });
});

// Rendering Pages
router.get("/settings", function (req, res, next) {
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }

  res.sendFile(pathToHtml("settings.html"));
});

module.exports = router;
