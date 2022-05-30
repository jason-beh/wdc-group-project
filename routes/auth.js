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
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID = "1067781733084-s7ifha851qrqvg6tldgs1qqccm0vrpi6.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
var db = require("../utils/db");
var argon2 = require("argon2");
const { v4: uuidv4 } = require("uuid");

var router = express.Router();

var nodemailer = require("nodemailer");

// Create the transporter with the required configuration for Outlook
var transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
    ciphers: "SSLv3",
  },
  auth: {
    user: "socialah@outlook.com",
    pass: "wdc2022sem1",
  },
});

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
      if (user.isGoogleSignUp == true) {
        return res.status(401).send("Please use Google to login.");
      }

      // If the user is not verified, we return 401
      if (user.isVerified == false) {
        return res.status(401).send("Please verify your email.");
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
              console.log(rows[0]);
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
  const { picture, email, given_name, family_name } = payload;

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
          query =
            "INSERT into User_Profile (email, first_name, last_name, profile_picture) VALUES (?, ?, ?, ?)";
          connection.query(query, [email, given_name, family_name, picture], function (err) {
            connection.release();
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }
          });

          return res.status(200).end();
        });
      }
    });
  });
});

router.get("/send-email", function (req, res, next) {
  let { email, action } = req.query;

  // If we lack any of these data, we return err
  if (!email || !action) {
    return res.status(400).send("Insufficient Data");
  }

  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Delete if a token has been generated for an email
    var query = "delete from Account_Verification where email = ?;";
    connection.query(query, [email], function (err) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      var token = uuidv4(); // Create a token
      query = "insert into Account_Verification (email, token) values (?, ?);";
      connection.query(query, [email, token], function (err) {
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        // setup e-mail data, even with unicode symbols
        var mailOptions = {
          from: "socialah@outlook.com", // sender address (who sends)
          to: email, // list of receivers (who receives)
          subject: "Hello ", // Subject line
          text: "Hello world ", // plaintext body
        };

        // Populate based on action
        if (action == "reset-password") {
          mailOptions[
            "html"
          ] = `<a href="http://localhost:3000/reset-password?email=${email}&token=${token}">Reset your password!</a>`;
        } else if (action == "verify-account") {
          mailOptions[
            "html"
          ] = `<a href="http://localhost:3000/verify?email=${email}&token=${token}">Verify your account!</a>`;
        } else {
          return res.status(500).send("An interval server error occurred.");
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            return console.log(error);
          }

          return res.send(email);
        });
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

            return res.redirect(`/send-email?email=${email}&action=verify-account`);
          });
        })
        .catch(function (err) {
          return res.status(500).send("An interval server error occurred.");
        });
    });
  });
});

router.get("/verify", function (req, res, next) {
  let { email, token } = req.query;

  // If we lack any of these data, we return err
  if (!email || !token) {
    return res.status(400).send("Insufficient Data");
  }

  // Check if the token is exist or not
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query = "select * from Account_Verification where token = ? and email = ?;";
    connection.query(query, [token, email], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      if (rows.length === 0) {
        return res.status(403).send("Invalid token or email");
      }
      // Delete the token
      query = "delete from Account_Verification where token = ? and email = ?;";
      connection.query(query, [token, email], function (err, rows, fields) {
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        // Create the user profile
        query = "INSERT into User_Profile (email, profile_picture) VALUES (?, ?)";
        connection.query(query, [email, "/user-profiles/defaultUserProfile.png"], function (err) {
          connection.release();
          if (err) {
            return res.status(500).send("An interval server error occurred.");
          }
          // Modify isVerified attribute
          query = "update Authentication set isVerified = 1 where email = ?;";
          connection.query(query, [email], function (err, rows, fields) {
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }

            // Log the user in
            req.session.user = {
              email: email,
              isAdmin: 0, // When a user signs up, they will not be an admin by default
              profile_picture: "/user-profiles/defaultUserProfile.png",
            };

            return res.redirect("/");
          });
        });
      });
    });
  });
});

router.post("/forget-password", function (req, res, next) {
  let { email } = req.body;

  // If we lack any of these data, we return err
  if (!email) {
    return res.status(400).send("Insufficient Data");
  }

  return res.redirect(`/send-email?email=${email}&action=reset-password`);
});

router.post("/reset-password", function (req, res, next) {
  let { email, token, password } = req.body;

  // If we lack any of these data, we return err
  if (!email || !token || !password) {
    return res.status(400).send("Insufficient Data");
  }

  // Check if the email and token exist
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Query the database
    var query = "select * from Account_Verification where token = ? and email = ?;";
    connection.query(query, [token, email], function (err, rows, fields) {
      if (err) {
        return res.status(500).send("An interval server error occurred.");
      }
      if (rows.length === 0) {
        return res.status(403).send("Invalid token or email");
      }
      // Delete the token
      query = "delete from Account_Verification where token = ? and email = ?;";
      connection.query(query, [token, email], function (err, rows, fields) {
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        // Hash and update password
        argon2
          .hash(password)
          .then(function (hashedPassword) {
            // Insert new user into database
            query = "UPDATE Authentication set password = ? where email = ?";
            connection.query(query, [hashedPassword, email], function (err) {
              connection.release();
              if (err) {
                return res.status(500).send("An interval server error occurred.");
              }
              return res.status(200).end();
            });
          })
          .catch(function (err) {
            return res.status(500).send("An interval server error occurred.");
          });
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

router.get("/verify-account", function (req, res, next) {
  res.sendFile(pathToHtml("verify-account.html"));
});

router.get("/forget-password", function (req, res, next) {
  res.sendFile(pathToHtml("forget-password.html"));
});

router.get("/reset-password", function (req, res, next) {
  res.sendFile(pathToHtml("reset-password.html"));
});

module.exports = router;
