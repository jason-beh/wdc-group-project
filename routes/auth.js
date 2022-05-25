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
// OAuth Library
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = "1067781733084-s7ifha851qrqvg6tldgs1qqccm0vrpi6.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
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

      // If the user used Google to signup, we return 401
      var user = rows[0];
      if(user.isGoogleSignUp == true) {
        return res.status(401).send("Please use Google to login.");
      }

      // Proceed to verify the hashed password
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
                userSession["profile_picture"] = "/user-profiles/defaultUserProfile.png";
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

router.post("/oauth", async function (req, res, next) {
  let { token } = req.body;

  // If we lack any of these data, we return err
  if (!token) {
    return res.status(400).send("Insufficient Data");
  }
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  
  });
  const payload = ticket.getPayload();
  const {picture, email, given_name, family_name} = payload;

  // Check if the user is existed
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query = "select * from Authentication where email = ?;";
    connection.query(query, [email], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occured.");
      }
      
      // If the email has already existed
      if (rows.length === 1) {
        var user = rows[0];
        let userSession = {
          email: user.email,
          isAdmin: user.isAdmin
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
            userSession["profile_picture"] = "/user-profiles/defaultUserProfile.png";
          }

          // Save userSession to user's session
          req.session.user = userSession;

          return res.status(200).end();
        })
      } else {
        // Insert new user into database
        query = "INSERT INTO Authentication (email, isGoogleSignUp, isVerified) VALUES (?, ?, ?)";
        connection.query(query, [email, true, true], function (err) {
          if (err) {
            return res.status(500).send("An interval server error occurred.");
          }

          // Create user session
          req.session.user = {
            email: email,
            isAdmin: 0, // When a user signs up, they will not be an admin by default
            profile_picture: picture,
          };

          // Create user profile
          query = "INSERT into User_Profile (email, first_name, last_name, profile_picture) VALUES (?, ?, ?, ?)";
          connection.query(
            query,
            [email, given_name, family_name, picture],
            function (err) {
              connection.release();
              if (err) {
                return res.status(500).send("An interval server error occurred.");
              }
            }
          );

          return res.status(200).end();
        });
      }
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
              profile_picture: "/user-profiles/defaultUserProfile.png",
            };

            // Create user profile
            query = "INSERT into User_Profile (email, profile_picture) VALUES (?, ?)";
            connection.query(
              query,
              [email, "/user-profiles/defaultUserProfile.png"],
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

router.get("/logout", function (req, res, next) {
  delete req.session.user;
  res.redirect("/login");
});

router.get("/get-session", function (req, res, next) {
  if (req.session.user) {
    return res.send(req.session.user);
  }

  return res.send(null);
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
