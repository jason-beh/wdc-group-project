var express = require("express");
var passport = require("passport");
var db = require("../utils/db");
var objects = require("../utils/objects");
var path = require("path");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");
const { createDate, addHours } = require("../utils/datetime");

var router = express.Router();

var nodemailer = require("nodemailer");

// Create the transporter with the required configuration for Outlook
var transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  secure: false,
  port: 587, // port for secure SMTP,
  pool: true,
  maxConnections: 5,
  tls: {
    ciphers: "SSLv3",
  },
  auth: {
    user: "hy7tjayeu3f3ganq@ethereal.email",
    pass: "kGSvXP3g4974KTHGgW",
  },
});

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
  db.connectionPool.getConnection(function (err, connection) {
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
  db.connectionPool.getConnection(function (err, connection) {
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
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    var query = "select * from Events where event_id = ?;";
    connection.query(query, [event_id], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }

      // add another if statement for event

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
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }
    var { event_id } = req.body;
    var query = "DELETE from Events where event_id = ?";
    connection.query(query, [event_id], function (err, rows, fields) {
      connection.release();
      if (err) {
        return next(err);
      }
      return res.send("Success in deleting an event!");
    });
  });
});

router.get("/my-events/organized", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  db.connectionPool.getConnection(function (err, connection) {
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
  db.connectionPool.getConnection(function (err, connection) {
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

  db.connectionPool.getConnection(function (err, connection) {
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

router.post("/finalise-event-time", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  // Make sure the user is the event creator
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }
    var { email, event_id, proposed_event_time_id } = req.body;
    var query = "select * from Events where created_by = ? and event_id = ?;";
    connection.query(query, [email, event_id], function (err, rows, fields) {
      if (!rows || rows.length == 0) {
        return res.status(401).send("Not an event creator!");
      }
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
            connection.release();
            if (err) {
              return next(err);
            }
            return res.send("Success in finalise an event!");
          }
        );
      });
    });
  });
});

router.post("/send-confirmation-email", function (req, res, next) {
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }
    var { event_id } = req.body;
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

        console.log(rows.length);

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
          transporter.sendMail(mailOptions, function (error, info) {
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

module.exports = router;
