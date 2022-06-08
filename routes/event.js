var express = require("express");
const { pathToHtml } = require("../utils/routes");
const { validationResult, check } = require("express-validator");

var router = express.Router();

router.get("/get-events", function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }
    let query =
      "SELECT * FROM Events INNER JOIN User_Profile ON USER_PROFILE.email = Events.created_by";
    connection.query(query, [], function (err, rows, fields) {
      connection.release();
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }

      return res.send(rows);
    });
  });
});

router.get("/events/:event_id", function (req, res, next) {
  let { event_id } = req.params;

  if (!event_id) {
    return res.status(400).send("Insufficient Data");
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query =
      "SELECT * FROM Events INNER JOIN User_Profile ON USER_PROFILE.email = Events.created_by WHERE Events.event_id = ?";
    connection.query(query, [event_id], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      var info = rows[0];
      if (info === null || typeof info == "undefined") {
        return res.status(500).send("An interval server error occurred.");
      }

      // Query another database
      query = "select * from Proposed_Event_Time where event_id = ?;";
      connection.query(query, [event_id], function (err, rows, fields) {
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        connection.release();
        info["date"] = rows;
        return res.json(info);
      });
    });
  });
});

<<<<<<< HEAD
router.post(
  "/finalise-event-time",
  check("email").isEmail().withMessage("Email is invalid"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.array()[0];
      return res.status(400).send(error.msg);
    }
    // Ensure an user is logged in
    if (!userIsLoggedIn(req.session.user)) {
      return res.status(401).send("Unauthorized Access!!");
    }

    var { email, event_id, proposed_event_time_id } = req.body;
    if (!email || !event_id || !proposed_event_time_id) {
      return res.status(400).send("Insufficient Data");
    }

    // Make sure the user is the event creator
    req.pool.getConnection(function (err, connection) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      var { email, event_id, proposed_event_time_id } = req.body;
      var query = "select * from Events where created_by = ? and event_id = ?;";
      connection.query(query, [email, event_id], function (err, rows, fields) {
        if (!rows || rows.length == 0) {
          return res.status(401).send("Not an event creator!");
        }

        let event = rows[0];

        query =
          "select * from Proposed_Event_Time where proposed_event_time_id = ? and event_id = ?;";
        connection.query(query, [proposed_event_time_id, event_id], function (err, rows, fields) {
          if (err) {
            return res.status(500).send("An interval server error occurred.");
          }
          query = "update Events set finalized_event_time_id = ? where event_id = ?;";
          connection.query(
            query,
            [rows[0]["proposed_event_time_id"], rows[0]["event_id"]],
            function (err, rows, field) {
              if (err) {
                return res.status(500).send("An interval server error occurred.");
              }

              // Send email to all users who previously specified availability
              query =
                "SELECT DISTINCT Availability.email from Proposed_Event_Time INNER JOIN Availability ON Availability.proposed_event_time_id = Proposed_Event_Time.proposed_event_time_id WHERE Proposed_Event_Time.event_id = ?;";
              connection.query(query, [event_id], function (err, rows, fields) {
                if (err) {
                  return res.status(500).send("An interval server error occurred.");
                }

                for (let row of rows) {
                  console.log(row.email);
                  query = "SELECT * FROM Notifications_Setting WHERE email = ?";
                  connection.query(query, [row["email"]], function (err, settingsRows, fields) {
                    if (err) {
                      return res.status(500).send("An interval server error occurred.");
                    }

                    // Send an email if they enable notifications
                    if (settingsRows.length != 0 && settingsRows[0]["is_event_finalised"] === 1) {
                      var mailOptions = {
                        from: "socialah@outlook.com", // sender address (who sends)
                        to: rows[0]["email"],
                        subject: "Event finalised", // Subject line
                        text: "Hello world ", // plaintext body
                      };
                      // TODO: Add finalised time into message
                      mailOptions["html"] = `<h1>Event finalised: ${event["title"]}</h1>`;
                      // send mail with defined transport object
                      req.transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                          return console.log(error);
                        }
                      });
                    }
                  });
                }
                return res.send("Success in finalise an event!");
              });
            }
          );
        });
      });
    });
  }
);

=======
>>>>>>> c10ae36da38a27d06a1e2d331c09e412a66cee18
router.post("/send-confirmation-email", function (req, res, next) {
  var { event_id } = req.body;
  if (!event_id) {
    return res.status(400).send("Insufficient Data");
  }
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }

    var query = "select * from Events where event_id = ?;";
    connection.query(query, [event_id], function (err, rows, fields) {
      if (err) {
        return next(err);
      }
      // Get the event details
      var eventContent = rows[0];

      query =
        "select distinct email from Availability inner join Proposed_Event_Time on Availability.proposed_event_time_id = Proposed_Event_Time.proposed_event_time_id where event_id = ?;";
      connection.query(query, [event_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          return next(err);
        }

        for (var index = 0; index < rows.length; index++) {
          // setup e-mail data, even with unicode symbols
          var mailOptions = {
            from: "socialah@outlook.com", // sender address (who sends)
            to: rows[index]["email"],
            subject: "Confirm my attendance!", // Subject line
            text: "Hello world ", // plaintext body
          };
          mailOptions["html"] = `<h1>${eventContent["title"]}</h1>
              <a href="http://localhost:3000/confirm-attendance?email=${mailOptions["to"]}&event_id=${event_id}">Confirm my attendance!</a>`;
          // send mail with defined transport object
          req.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              return console.log(error);
            }
          });
        }
      });
      return res.send("Success in sending confirmation email!");
    });
  });
});

router.post("/show-details", function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    var { event_id } = req.body;
    var query = "SELECT * FROM Events where event_id = ?;";
    connection.query(query, [event_id], function (err, rows, fields) {
      if (err) {
        return next(err);
      }
      connection.release();
    });
  });
});

router.post("/get-proposed-time", function (req, res, next) {
  var { event_id } = req.body;
  if (!event_id) {
    return res.status(400).send("Insufficient Data");
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }

    var query =
      "SELECT COUNT(*), pet.start_date, pet.end_date, pet.proposed_event_time_id, pet.event_id FROM Availability a INNER JOIN Proposed_Event_Time AS pet ON a.proposed_event_time_id = pet.proposed_event_time_id GROUP BY pet.proposed_event_time_id HAVING pet.event_id = ?;";
    connection.query(query, [event_id], function (err, rows, field) {
      connection.release();
      if (err) {
        return next(err);
      }
      res.send(rows);
    });
  });
});

router.post("/get-finalise-time", function (req, res, next) {
  var { finalise_event_time_id } = req.body;
  if (!finalise_event_time_id) {
    return res.status(400).send("Insufficient Data");
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }

    var query = "SELECT * FROM proposed_event_time where proposed_event_time_id = ?;";
    connection.query(query, [finalise_event_time_id], function (err, rows, field) {
      connection.release();
      if (err) {
        return next(err);
      }
      res.send(rows);
    });
  });
});

router.post(
  "/get-attendance",
  check("user_email").isEmail().withMessage("Email is invalid"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.array()[0];
      return res.status(400).send(error.msg);
    }

    var { user_email, event_id } = req.body;
    if (!event_id || !user_email) {
      return res.status(400).send("Insufficient Data");
    }

    req.pool.getConnection(function (err, connection) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }

      var query = "SELECT * FROM attendance where email = ? AND event_id = ?;";
      connection.query(query, [user_email, event_id], function (err, rows, field) {
        connection.release();
        if (err) {
          return next(err);
        }
        return res.send(rows);
      });
    });
  }
);

router.get("/event-details", function (req, res, next) {
  res.sendFile(pathToHtml("event-details.html"));
});

module.exports = router;
