// ==========================================================================================
//  User Authentication Component
// ==========================================================================================
/* 
    Date: 2022-05-12
    The implementation of user authentication component.
    Functionalities: Sign up / Login / Log out
*/

var express = require("express");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");
var db = require("../utils/db");
var argon2 = require("argon2");

var router = express.Router();

router.post("/login", function (req, res, next) {
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

      // If the email does not exist in any account, we return 401
      if (!rows || rows.length == 0) {
        return res.status(401).send("Incorrect email or password.");
      }

      // Proceed to verify the hashed password
      var user = rows[0];
      argon2
        .verify(user["password"], password)
        .then(function (success) {
          // If the password is incorrect, we return 401
          if (!success) {
            return res.status(401).send("Incorrect email or password.");
          } else {
            // Create userSession object
            let userSession = {
              email: user.email,
              isAdmin: user.isAdmin,
            };

            // Get profile picture if available
            var query = "select * from User_Profile where email = ?";
            connection.query(query, [user.email], function (err, rows, fields) {
              connection.release();
              if (err) {
                return res.status(500).send("An interval server error occurred.");
              }

              // Add profile image to the session if we are able to find it
              if (rows && rows[0]["profile_picture"] !== null) {
                userSession["profile_picture"] = rows[0]["profile_picture"];
              } else {
                userSession["profile_picture"] = "";
              }

              // Save userSession to user's session
              req.session.user = userSession;

              return res.status(200).end();
            });
          }
        })
        .catch(function (err) {
          return res.status(500).send("An interval server error occurred.");
        });
    });
  });
});

router.post("/signup", function (req, res, next) {
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
          // Insert new user into database
          query = "INSERT INTO Authentication (email, password) VALUES (?, ?)";
          connection.query(query, [email, hashedPassword], function (err) {
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }

            // Create user session
            req.session.user = {
              email: email,
              isAdmin: 0, // When a user signs up, they will not be an admin by default
              profile_picture: "",
            };

            // Create user profile
            query = "INSERT into User_Profile (email) VALUES (?)";
            connection.query(query, [req.body.email], function (err) {
              connection.release();
              if (err) {
                return res.status(500).send("An interval server error occurred.");
              }
            });

            return res.status(200).end();
          });
        })
        .catch(function (err) {
          return res.status(500).send("An interval server error occurred.");
        });
    });
  });
});

router.get("/logout", function (req, res, next) {
  delete req.session.user;
  res.redirect("/login");
});

router.get("/check-user", function (req, res, next) {
  res.send(req.session.user);
});

// Rendering Pages
router.get("/login", function (req, res, next) {
  if (userIsLoggedIn(req.session.user)) {
    res.redirect("/");
  }
  res.sendFile(pathToHtml("login.html"));
});

router.get("/signup", function (req, res, next) {
  if (userIsLoggedIn(req.session.user)) {
    return res.redirect("/");
  }
  res.sendFile(pathToHtml("signup.html"));
});

module.exports = router;
