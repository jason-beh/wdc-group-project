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
        console.log(err);
        return res.status(500).send("An interval server error occurred.");
      }
      var { email, event_id } = req.query;
      if (!email || !event_id) {
        return res.status(500).send("Insufficient Data");
      }
      var query = "SELECT * from Attendance where email = ? and event_id = ?;";
      connection.query(query, [email, event_id], function (err, rows, fields) {
        if (err) {
          console.log(err);
          return res.status(500).send("An interval server error occurred.");
        }

        if (rows && rows.length > 0) {
          return res.status(500).send("Availability has been previously specified");
        }

        query = "insert into Attendance values (?, ?);";
        connection.query(query, [email, event_id], function (err, rows, fields) {
          connection.release();
          if (err) {
            console.log(err);
            return res.status(500).send("An interval server error occurred.");
          }

          // Send email to the creator
          query = "SELECT * FROM Events WHERE event_id = ?";
          connection.query(query, [event_id], function (err, rows, fields) {
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }

            let event = rows[0];

            query = "SELECT * FROM Notifications_Setting WHERE email = ?";
            connection.query(query, [event["created_by"]], function (err, settingsRows, fields) {
              if (err) {
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
                    return console.log(error);
                  }
                });
              }
            });

            return res.status(200).end();
          });
        });
      });
    });
  }
);

module.exports = router;
