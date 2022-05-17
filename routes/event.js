var express = require("express");
var passport = require("passport");
var db = require("../utils/db");
var objects = require("../utils/objects");
var path = require("path");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");
const { createDate, addHours } = require("../utils/datetime");

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

router.post("/create-event", upload.array("file", 1));
router.post("/create-event", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  // Get all data from request body
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
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

    var event_picture = `/user-profiles/${req.files[0].filename}`;

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
          console.log(err);
          return res.status(500).send("An interval server error occurred.");
        }

        // Get event id after inserting to database to populate proposed times
        let event_id  = rows.insertId;

        proposed_times = proposed_times.split(',');
        
        for(let proposed_time of proposed_times) {
          let start_date = createDate(proposed_date, proposed_time);
          let end_date = addHours(start_date, duration);

          // Insert proposed event time into database
          query = "INSERT INTO Proposed_Event_Time (event_id, start_date, end_date) VALUES (?, ?, ?)";
          connection.query(query, [event_id, start_date, end_date], function (err, rows, field) {
            if (err) {
              console.log(err);
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

router.post("/edit-event", function (req, res, next) {
  // Ensure an user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return next(err);
    }
    var {
      title,
      description,
      proposal_date,
      start_date,
      end_date,
      address_line,
      state,
      country,
      postcode,
      event_id,
    } = req.body;
    var query =
      "UPDATE Events set title = ?, description = ?, proposal_date = ?, start_date = ?, end_date = ?, address_line = ?, state = ?, country = ?, postcode = ? where event_id = ?";
    connection.query(
      query,
      [
        title,
        description,
        proposal_date,
        start_date,
        end_date,
        address_line,
        state,
        country,
        postcode,
        event_id,
      ],
      function (err, rows, fields) {
        connection.release();
        if (err) {
          return next(err);
        }
        return res.send("Success in modifying the event!");
      }
    );
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
    connection.query(query, [req.user.email], function (err, rows, fields) {
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
      "select title, description, proposal_date, start_date, end_date, custom_link, address_line, state, country, postcode from Events inner join Attendance where Attendance.email = ? && Attendance.event_id = Events.event_id";
    connection.query(query, [req.user.email], function (err, rows, fields) {
      connection.release();
      if (err) {
        return next(err);
      }
      return res.send(rows);
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
