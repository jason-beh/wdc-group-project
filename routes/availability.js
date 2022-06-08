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
      connection.release();
      return res.status(500).send("An internal server error occurred.");
    }
    // Edge case handling (Specify availability cannot be done after the event is finalized)
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
      if (rows[0]["finalized_event_time_id"]) {
        connection.release();
        return res
          .status(405)
          .send("You cannot specify availability after the event is finalized.");
      }

      let email = "";

      let baseQueryOptions;

      if (!userIsLoggedIn(req.session.user)) {
        if (!req.body.email) {
          connection.release();
          return res.status(400).send("Insufficient Data");
        }
        check(req.body.email).isEmail().withMessage("Email is invalid");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          let error = errors.array()[0];
          connection.release();
          return res.status(400).send(error.msg);
        }
        email = req.body["email"];
        baseQueryOptions = [req.body["email"]];
      } else {
        email = req.session.user.email;
        baseQueryOptions = [req.session.user.email];
      }

      // delete previous availability
      let queryOptions = [...baseQueryOptions, event_id];
      let query =
        "delete Availability from Availability inner join Proposed_Event_Time on Availability.proposed_event_time_id = Proposed_Event_Time.proposed_event_time_id where email = ? and event_id = ?;";
      connection.query(query, queryOptions, function (err, rows, fields) {
        if (err) {
          connection.release();
          return res.status(500).send("An interval server error occurred.");
        }

        // insert new availability
        for (let index = 0; index < proposed_event_id.length; index++) {
          let queryOptions = [...baseQueryOptions, proposed_event_id[index]];

          query = "INSERT INTO Availability VALUES (?, ?);";
          connection.query(query, queryOptions, function (err, rows, fields) {
            if (err) {
              console.log(err);
              connection.release();
              return res.status(500).send("An interval server error occurred.");
            }

            // Send email to the event creator
            query = "SELECT * FROM Events WHERE event_id = ?";
            connection.query(query, [event_id], function (err, rows, fields) {
              if (err) {
                connection.release();
                return res.status(500).send("An interval server error occurred.");
              }

              let event = rows[0];

              query = "SELECT * FROM Notifications_Setting WHERE email = ?";
              connection.query(query, [event["created_by"]], function (err, settingsRows, fields) {
                if (err) {
                  connection.release();
                  return res.status(500).send("An interval server error occurred.");
                }

                // Send an email if they enable notifications
                if (settingsRows[0]["is_availability_confirmed"] === 1) {
                  var mailOptions = {
                    from: "socialah@outlook.com", // sender address (who sends)
                    to: settingsRows[0]["email"],
                    subject: "Specified Availability", // Subject line
                    text: "Hello world ", // plaintext body
                  };
                  mailOptions[
                    "html"
                  ] = `<h1>${email} has specified their availability for ${event["title"]}</h1>`;
                  // send mail with defined transport object
                  req.transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      connection.release();
                      return console.log(error);
                    }
                  });
                }
              });
            });
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
