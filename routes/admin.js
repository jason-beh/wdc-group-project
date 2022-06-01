var express = require("express");
const { userIsAdmin } = require("../utils/auth");
var db = require("../utils/db");
var argon2 = require("argon2");
const { pathToHtml } = require("../utils/routes");
var router = express.Router();

router.get("/view-events", function (req, res, next) {
  // Ensure the admin is logged in
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access");
  }
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    var query = "SELECT * from Events";
    connection.query(query, function (err, rows, fields) {
      connection.release();
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      return res.send(rows);
    });
  });
});

router.get("/view-users", function (req, res, next) {
  // Ensure the admin is logged in
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access");
  }
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    var query = "SELECT * from User_Profile";
    connection.query(query, function (err, rows, fields) {
      connection.release();
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      return res.send(rows);
    });
  });
});

router.post("/create-admin", function (req, res, next) {
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access");
  }

  let { email, password } = req.body;

  // If we lack any of these data, we return err
  if (!email || !password) {
    return res.status(400).send("Insufficient Data");
  }

  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query = "SELECT * FROM Authentication WHERE email = ?";
    connection.query(query, [email], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }

      // If the email already exist, we return 401
      if (rows && rows.length == 1) {
        return res.status(401).send("The account already exists");
      }

      // Proceed to hash the password
      argon2
        .hash(password)
        .then(function (hashedPassword) {
          // Insert new system admin into database
          query =
            "INSERT INTO Authentication (email, password, isAdmin, isVerified) VALUES (?, ?, 1, 1)";
          connection.query(query, [email, hashedPassword], function (err) {
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }

            // Create user profile for the admin
            query = "INSERT into User_Profile (email, profile_picture) VALUES (?, ?)";
            connection.query(
              query,
              [req.body.email, "/user-profiles/defaultUserProfile.png"],
              function (err) {
                connection.release();
                if (err) {
                  return res.status(500).send("An interval server error occurred.");
                }
              }
            );

            return res.status(200).end();
          });
        })
        .catch(function (err) {
          return res.status(500).send("An interval server error occurred.");
        });
    });
  });
});

router.post("/create-user", function (req, res, next) {
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access");
  }

  let { email, password } = req.body;

  // If we lack any of these data, we return err
  if (!email || !password) {
    return res.status(400).send("Insufficient Data");
  }

  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query = "SELECT * FROM Authentication WHERE email = ?";
    connection.query(query, [email], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }

      // If the email already exist, we return 401
      if (rows && rows.length == 1) {
        return res.status(401).send("The account already exists");
      }

      // Proceed to hash the password
      argon2
        .hash(password)
        .then(function (hashedPassword) {
          // Insert new system admin into database
          query =
            "INSERT INTO Authentication (email, password, isAdmin, isVerified) VALUES (?, ?, 1, 0)";
          connection.query(query, [email, hashedPassword], function (err) {
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }

            // Create user profile for the admin
            query = "INSERT into User_Profile (email, profile_picture) VALUES (?, ?)";
            connection.query(
              query,
              [req.body.email, "/user-profiles/defaultUserProfile.png"],
              function (err) {
                connection.release();
                if (err) {
                  return res.status(500).send("An interval server error occurred.");
                }
              }
            );

            return res.status(200).end();
          });
        })
        .catch(function (err) {
          return res.status(500).send("An interval server error occurred.");
        });
    });
  });
});
router.post("/delete-user", function (req, res, next) {
  // Ensure the admin is logged in
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access");
  }

  let { email } = req.body;

  // If we lack any of these data, we return err
  if (!email) {
    return res.status(400).send("Insufficient Data");
  }

  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query = "delete from Authentication where email = ?;";
    connection.query(query, [email], function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        return res.status(500).send("An interval server error occurred.");
      }
      return res.send("Success in deleting a user!");
    });
  });
});

router.post("/delete-event", function (req, res, next) {
  // Ensure the admin is logged in
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access");
  }

  let { eventID } = req.body;

  // If we lack any of these data, we return err
  if (!eventID) {
    return res.status(400).send("Insufficient Data");
  }

  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query = "delete from Events where event_id = ?;";
    connection.query(query, [eventID], function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        return res.status(500).send("An interval server error occurred.");
      }
      return res.send("Successfully deleted event !");
    });
  });
});

router.post("/admin-edit-event", function (req, res, next) {
  // Ensure the user is logged in
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  // Deference
  var {
    event_id,
    title,
    description,
    proposed_date,
    street_number,
    street_name,
    suburb,
    state,
    country,
    postcode,
    event_picture,
  } = req.body;
  // Get all data from request body
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Update data
    var query =
      "update Events set title = ?, description = ?, proposed_date = ?, street_number = ?, street_name = ?, suburb = ?, state = ?, country = ?, postcode = ?, event_picture = ? where event_id = ?";
    connection.query(
      query,
      [
        title,
        description,
        proposed_date,
        street_number,
        street_name,
        suburb,
        state,
        country,
        postcode,
        event_picture,
        event_id,
      ],
      function (err, rows, fields) {
        connection.release();
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        return res.send("Admin successes in updating event details!");
      }
    );
  });
});

router.post("/admin-edit-profile", function (req, res, next) {
  // Ensure the user is logged in
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  // Deference
  var {
    first_name,
    last_name,
    birthday,
    instagram_handle,
    facebook_handle,
    state,
    country,
    email,
  } = req.body;
  // Get all data from request body
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Update data
    var query =
      "update User_Profile set first_name = ?, last_name = ?, birthday = ?, instagram_handle = ?, facebook_handle = ?, state = ?, country = ? where email = ?";
    connection.query(
      query,
      [first_name, last_name, birthday, instagram_handle, facebook_handle, state, country, email],
      function (err, rows, fields) {
        connection.release();
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        return res.send("Admin successes in updating user profile!");
      }
    );
  });
});

router.post("/get-event-admin", function (req, res, next) {
  let { eventToSearch } = req.body;
  if (!eventToSearch) {
    return res.status(400).send("Insufficient Data");
  }
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access !!");
  }
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Get data
    var query = "select * from Events where event_id = ?";
    connection.query(query, [eventToSearch], function (err, rows, fields) {
      connection.release();
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      // check
      if (!rows && rows.length == 0) {
        return res.send("Event not found!");
      }
      return res.send(rows[0]);
    });
  });
});
router.post("/get-profile-admin", function (req, res, next) {
  let { emailToSearch } = req.body;
  if (!emailToSearch) {
    return res.status(400).send("Insufficient Data");
  }
  if (!userIsAdmin(req.session.user)) {
    return res.status(401).send("Unauthorized Access !!");
  }
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Get data
    var query = "select * from User_Profile where email = ?";
    connection.query(query, [emailToSearch], function (err, rows, fields) {
      connection.release();
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      // check
      if (!rows && rows.length == 0) {
        return res.send("User not found!");
      }
      return res.send(rows[0]);
    });
  });
});
router.get("/admin-view", function (req, res, next) {
  res.sendFile(pathToHtml("admin-view.html"));
});
router.get("/admin-view-events", function (req, res, next) {
  res.sendFile(pathToHtml("admin-view-events.html"));
});
module.exports = router;
