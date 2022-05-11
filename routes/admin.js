var express = require("express");
const { userIsAdmin } = require("../utils/auth");
var db = require("../utils/db");
var argon2 = require("argon2");

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
    var query = "SELECT * from Authentication";
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
          query = "INSERT INTO Authentication (email, password, isAdmin) VALUES (?, ?, 1)";
          connection.query(query, [email, hashedPassword], function (err) {
            if (err) {
              return res.status(500).send("An interval server error occurred.");
            }

            // Create user profile for the admin
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

module.exports = router;
