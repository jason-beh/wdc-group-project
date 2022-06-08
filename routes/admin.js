var express = require("express");
const { userIsAdmin } = require("../utils/auth");
var argon2 = require("argon2");
const { pathToHtml } = require("../utils/routes");
const { body, validationResult, check } = require("express-validator");
var router = express.Router();
const fs = require("fs");

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

router.get("/view-events", function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
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
  req.pool.getConnection(function (err, connection) {
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

router.post(
  "/create-admin",
  check("email").isEmail().withMessage("Email is invalid"),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must have at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol. It must also be at least 8 letters long."
    ),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.array()[0];
      return res.status(400).send(error.msg);
    }

    let { email, password } = req.body;

    // If we lack any of these data, we return err
    if (!email || !password) {
      return res.status(400).send("Insufficient Data");
    }

    req.pool.getConnection(function (err, connection) {
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
  }
);

router.post(
  "/create-user",
  check("email").isEmail().withMessage("Email is invalid"),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must have at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol. It must also be at least 8 letters long."
    ),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.array()[0];
      return res.status(400).send(error.msg);
    }

    let { email, password } = req.body;

    // If we lack any of these data, we return err
    if (!email || !password) {
      return res.status(400).send("Insufficient Data");
    }

    req.pool.getConnection(function (err, connection) {
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
              "INSERT INTO Authentication (email, password, isAdmin, isVerified) VALUES (?, ?, 0, 1)";
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
  }
);

router.delete(
  "/delete-user",
  check("email").isEmail().withMessage("Email is invalid"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.array()[0];
      return res.status(400).send(error.msg);
    }

    let { email } = req.body;

    // If we lack any of these data, we return err
    if (!email) {
      return res.status(400).send("Insufficient Data");
    }

    // Edge case handling (Admin cannot delete himself / herself)
    if (email == req.session.user.email) {
      return res.status(405).send("You are not allowed to delete yourself.");
    }

    req.pool.getConnection(function (err, connection) {
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
  }
);

router.delete("/delete-event", function (req, res, next) {
  let { eventID } = req.body;

  // If we lack any of these data, we return err
  if (!eventID) {
    return res.status(400).send("Insufficient Data");
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
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

router.post("/edit-event", upload.array("file", 1));
router.post("/edit-event", function (req, res, next) {
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
          "UPDATE Events set title = ?, description = ?, street_number = ?, street_name = ?, suburb = ?, state = ?, country = ?, postcode = ? where event_id = ?";
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

router.post(
  "/edit-profile",
  check("email").isEmail().withMessage("Email is invalid"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.array()[0];
      return res.status(400).send(error.msg);
    }

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
    // Get all data from request body and check for completeness
    if (
      !first_name ||
      !last_name ||
      !birthday ||
      !instagram_handle ||
      !facebook_handle ||
      !state ||
      !country ||
      !email
    ) {
      return res.status(400).send("Insufficient Data");
    }

    // Get all data from request body
    req.pool.getConnection(function (err, connection) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }

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
      req.pool.getConnection(function (err, connection) {
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        // Update data
        var query =
          "update User_Profile set first_name = ?, last_name = ?, birthday = ?, instagram_handle = ?, facebook_handle = ?, state = ?, country = ? where email = ?";
        connection.query(
          query,
          [
            first_name,
            last_name,
            birthday,
            instagram_handle,
            facebook_handle,
            state,
            country,
            email,
          ],
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
  }
);

router.post("/get-event", function (req, res, next) {
  let { event_id } = req.body;
  if (!event_id) {
    return res.status(400).send("Insufficient Data");
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Get data
    var query = "select * from Events where event_id = ?";
    connection.query(query, [event_id], function (err, rows, fields) {
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

router.post(
  "/get-profile",
  check("email").isEmail().withMessage("Email is invalid"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.array()[0];
      return res.status(400).send(error.msg);
    }
    let { email } = req.body;
    if (!email) {
      return res.status(400).send("Insufficient Data");
    }

    req.pool.getConnection(function (err, connection) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      // Get data
      var query = "select * from User_Profile where email = ?";
      connection.query(query, [email], function (err, rows, fields) {
        connection.release();
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        console.log(rows);
        // check
        if (!rows && rows.length == 0) {
          return res.send("User not found!");
        }
        return res.send(rows[0]);
      });
    });
  }
);

// Rendering Pages
router.get("/", function (req, res, next) {
  res.sendFile(pathToHtml("admin-dashboard.html"));
});

router.get("/users", function (req, res, next) {
  res.sendFile(pathToHtml("admin-users.html"));
});

router.get("/events", function (req, res, next) {
  res.sendFile(pathToHtml("admin-events.html"));
});
module.exports = router;
