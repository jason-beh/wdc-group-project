var express = require("express");
var passport = require("passport");
var objects = require("../utils/objects");
var path = require("path");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");
const { createDate, addHours } = require("../utils/datetime");
const { body, validationResult, check } = require("express-validator");

var router = express.Router();

// add multer library
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/events");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "." + file.originalname.split(".").pop());
  },
});
var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

// remove a file
const fs = require("fs");

router.get("/get-events", function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }
    var query = "SELECT * FROM Events";
    connection.query(query, [], function (err, rows, fields) {
      connection.release();
      if (err) {
        return next(err);
      }
      return res.send(rows);
    });
  });
});

router.post("/create-event", upload.array("file", 1));
router.post("/create-event", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  // Get all data from request body
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Deference
    var {
      title,
      description,
      proposed_date,
      street_number,
      street_name,
      suburb,
      state,
      country,
      postcode,
      duration,
      proposed_times,
    } = req.body;
    // Get all data from request body and check for completeness
    if (
      !title ||
      !description ||
      !proposed_date ||
      !street_number ||
      !street_name ||
      !state ||
      !country ||
      !postcode ||
      !duration ||
      !proposed_times
    ) {
      return res.status(400).send("Insufficient Data");
    }
    var event_picture = `/images/events/${req.files[0].filename}`;
    var query =
      "INSERT INTO Events (title, description, created_by, proposed_date, street_number, street_name, suburb, state, country, postcode, event_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(
      query,
      [
        title,
        description,
        req.session.user.email,
        proposed_date,
        street_number,
        street_name,
        suburb,
        state,
        country,
        postcode,
        event_picture,
      ],
      function (err, rows, fields) {
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }

        // Get event id after inserting to database to populate proposed times
        let event_id = rows.insertId;

        proposed_times = proposed_times.split(",");

        for (let proposed_time of proposed_times) {
          let start_date = createDate(proposed_date, proposed_time);
          let end_date = addHours(start_date, duration);

          // Insert proposed event time into database
          query =
            "INSERT INTO Proposed_Event_Time (event_id, start_date, end_date) VALUES (?, ?, ?)";
          connection.query(query, [event_id, start_date, end_date], function (err, rows, field) {
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }
          });
        }

        connection.release();

        return res.send("Success in creating an event");
      }
    );
  });
});

router.post("/edit-event", upload.array("file", 1));
router.post("/edit-event", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }

  var {
    title,
    description,
    street_number,
    street_name,
    suburb,
    state,
    country,
    postcode,
    event_picture,
    event_id,
  } = req.body;

  if (
    !title ||
    !description ||
    !street_number ||
    !street_name ||
    !suburb ||
    !state ||
    !country ||
    !postcode ||
    !event_id
  ) {
    return res.status(400).send("Insufficient Data");
  }

  // Remove the previous file
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    var query = "select * from Events where event_id = ?;";
    connection.query(query, [event_id], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }

      if (!rows || rows.length === 0) {
        return res.status(500).send("Event could not be found");
      }

      var previousPath = rows[0]["event_picture"];

      if (req.files.length === 0) {
        var query =
          "UPDATE Events set title = ?, description = ?, street_number = ?, street_name = ?, suburb = ?, state = ?, country = ?, postcode = ? where event_id = ? and created_by = ?";
        connection.query(
          query,
          [
            title,
            description,
            street_number,
            street_name,
            suburb,
            state,
            country,
            postcode,
            event_id,
            req.session.user.email,
          ],
          function (err, rows, fields) {
            if (err) {
              return next(err);
            }
            return res.send("Success in modifying the event!");
          }
        );
      } else {
        try {
          fs.unlinkSync("public" + previousPath);
        } catch (err) {
          console.error(err);
        }

        req.files.forEach(function (file) {
          // Sends path name back to database
          var imagePath = `/images/events/${file.filename}`;

          var query =
            "UPDATE Events set title = ?, description = ?, street_number = ?, street_name = ?, suburb = ?, state = ?, country = ?, postcode = ?, event_picture = ? where event_id = ? and created_by = ?";
          connection.query(
            query,
            [
              title,
              description,
              street_number,
              street_name,
              suburb,
              state,
              country,
              postcode,
              imagePath,
              event_id,
              req.session.user.email,
            ],
            function (err, rows, fields) {
              if (err) {
                return next(err);
              }
              return res.send("Success in modifying the event!");
            }
          );
        });
      }
    });
  });
});

router.delete("/delete-event", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  var { event_id } = req.body;
  if (!event_id) {
    return res.status(400).send("Insufficient Data");
  }
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }

    let query = "SELECT * from Events WHERE event_id = ? and created_by = ?";
    connection.query(query, [event_id, req.session.user], function (err, rows, fields) {
      if (err) {
        console.log(err);
        return res.status(500).send("An interval server error occurred.");
      }

      if (!rows || rows.length === 0) {
        return res.status(500).send("Event could not be found");
      }

      let event = rows[0];

      query = "DELETE * from Events where event_id = ? and created_by = ?";
      connection.query(query, [event_id, req.session.user], function (err, rows, fields) {
        if (err) {
          console.log(err);
          return res.status(500).send("An interval server error occurred.");
        }

        // Send email to all confirmed attendance
        query = "SELECT email FROM Attendance WHERE event_id = ?";
        connection.query(query, [event_id], function (err, rows, fields) {
          if (err) {
            return res.status(500).send("An interval server error occurred.");
          }
          for (let row of rows) {
            query = "SELECT * FROM Notifications_Setting WHERE email = ?";
            connection.query(query, [row["email"]], function (err, settingsRows, fields) {
              if (err) {
                return res.status(500).send("An interval server error occurred.");
              }
              // Send an email if they enable notifications
              if (settingsRows[0]["is_event_cancelled"] === 1) {
                var mailOptions = {
                  from: "socialah@outlook.com", // sender address (who sends)
                  to: rows[0]["email"],
                  subject: "Event cancelled", // Subject line
                  text: "Hello world ", // plaintext body
                };
                mailOptions["html"] = `<div
                                  style="
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        text-align: center;
                                        font-family: monospace;
                                        margin-top : 5%;
                                      
                                      "
                                >
                                  <img
                                    src="https://thumbs.dreamstime.com/b/bubble-handwriting-lettering-sorry-vintage-vector-engraving-speech-black-beige-illustration-poster-info-graphic-web-176397490.jpg"
                                    alt="Cancelled Event Image"
                                    style="max-width: 200px; max-height: 200px"
                                  />
                                  <h1>We are very sad to inform you that...</h1>
                                  <h2>An event that you were interested in was cancelled !>
                                  <h2>Event cancelled: ${event["title"]}</h2>

                              
                                </div>`;
                // send mail with defined transport object
                req.transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    return console.log(error);
                  }
                });
              }
            });
          }
          return res.send("Success in deleting an event!");
        });
      });
    });
  });
});

router.get("/my-events/organized", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }
    var query = "SELECT * FROM Events WHERE created_by = ?";
    connection.query(query, [req.session.user.email], function (err, rows, fields) {
      connection.release();
      if (err) {
        return next(err);
      }
      return res.send(rows);
    });
  });
});

router.get("/my-events/attended", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  req.pool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }
    var query =
      "SELECT * FROM Events INNER JOIN Attendance WHERE Attendance.email = ? and Attendance.event_id = Events.event_id";
    connection.query(query, [req.session.user.email], function (err, rows, fields) {
      connection.release();
      if (err) {
        return next(err);
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
    var query = "SELECT * FROM Events WHERE event_id = ?;";
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
            return next(err);
          }
          query = "update Events set finalized_event_time_id = ? where event_id = ?;";
          connection.query(
            query,
            [rows[0]["proposed_event_time_id"], rows[0]["event_id"]],
            function (err, rows, field) {
              if (err) {
                return next(err);
              }

              // Send email to all users who previously specified availability
              query =
                "SELECT * from Proposed_Event_Time INNER JOIN Availability ON Availability.proposed_event_time_id = Proposed_Event_Time.proposed_event_time_id WHERE Proposed_Event_Time.event_id = ?;";
              connection.query(query, [event_id], function (err, rows, fields) {
                if (err) {
                  return res.status(500).send("An interval server error occurred.");
                }

                for (let row of rows) {
                  query = "SELECT * FROM Notifications_Setting WHERE email = ?";
                  connection.query(query, [row["email"]], function (err, settingsRows, fields) {
                    if (err) {
                      return res.status(500).send("An interval server error occurred.");
                    }
                    // Send an email if they enable notifications
                    if (settingsRows[0]["is_event_finalised"] === 1) {
                      var mailOptions = {
                        from: "socialah@outlook.com", // sender address (who sends)
                        to: rows[0]["email"],
                        subject: "Event finalised", // Subject line
                        text: "Hello world ", // plaintext body
                      };
                      // TODO: Add finalised time into message
                      mailOptions["html"] = `  <div
                                                  style="
                                                    display: flex;
                                                    flex-direction: column;
                                                    align-items: center;
                                                    text-align: center;
                                                    font-family: monospace;
                                                    margin-top: 5%;
                                                  "
                                                >
                                                  <img
                                                    src="https://cdn-icons-png.flaticon.com/512/4353/4353420.png"
                                                    alt="Confetti Image"
                                                    style="max-width: 200px; max-height: 200px"
                                                  />
                                                  <h1>An event that you were interested in has finalised it's event time</h1>
                                                  <h2>Event finalised: ${event["title"]}</h2>

                                                  <a
                                                    style="
                                                      padding: 10px;
                                                      color: white;
                                                      background-color: #0d184f;
                                                      border-radius: 10px;
                                                      border: none;
                                                      margin: 30px auto 0 auto;
                                                      display: flex;
                                                      justify-content: center;
                                                      align-items: center;
                                                      box-sizing: border-box;
                                                      height: 50px;
                                                      text-decoration: none;
                                                    "
                                                    href="http://localhost:3000/confirm-attendance?email=${mailOptions["to"]}&event_id=${event_id}"
                                                  >
                                                    Confirm Attendance
                                                  </a>
                                                </div>`;
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

// router.post("/confirm-attendance", function (req, res, next) {
//   var { user_email, event_id } = req.body;
//   if (!event_id || !user_email) {
//     return res.status(400).send("Insufficient Data");
//   }

//   req.pool.getConnection(function (err, connection) {
//     if (err) {
//       return res.status(500).send("An interval server error occurred.");
//     }

//     var query = "INSERT INTO Attendance VALUES(?, ?);";
//     connection.query(query, [user_email, event_id], function (err, rows, field) {
//       connection.release();
//       if (err) {
//         return next(err);
//       }
//       return res.send("Success in confirming attendance !");
//     });
//   });
// });

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

// Rendering Pages
router.get("/create-event", function (req, res, next) {
  if (!userIsLoggedIn(req.session.user)) {
    res.redirect("/login");
  }
  res.sendFile(pathToHtml("create-event.html"));
});

router.get("/edit-event", function (req, res, next) {
  if (!userIsLoggedIn(req.session.user)) {
    res.redirect("/login");
  }
  res.sendFile(pathToHtml("edit-event.html"));
});

router.get("/event-details", function (req, res, next) {
  res.sendFile(pathToHtml("event-details.html"));
});

module.exports = router;
