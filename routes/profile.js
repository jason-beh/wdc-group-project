var express = require("express");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var db = require("../utils/db");
var argon2 = require("argon2");
const { userIsLoggedIn } = require("../utils/auth");
const { pathToHtml } = require("../utils/routes");

// add multer library
var multer = require('multer');
var upload = multer({ 
    dest: 'public/user-profiles',
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

// remove a file
const fs = require('fs');

var uploaded_images = [];

var router = express.Router();

var previousPath;
router.post('/change-profile-image', upload.array('file', 1));
router.post('/change-profile-image', function(req, res, next) {
    // Remove previous file
    db.connectionPool.getConnection(function(err, connection) {
        if (err) { 
            return res.status(500).send("An interval server error occurred.");
        }
        var query = "select profile_picture from User_Profile where email = ?;";
        connection.query(query, [req.session.user.email], function (err, rows, fields) {
            connection.release();
            if (err) { return res.status(500).send("An interval server error occurred."); }
            previousPath = rows[0]["profile_picture"];
            // if previousPath exists
            if (previousPath !== "") {
                try {
                    fs.unlinkSync(previousPath);
                  } catch(err) {
                    console.error(err);
                  }
            }
        });
    });
    req.files.forEach(function(file) {
        uploaded_images.push(file.filename);
        // Sends path name back to database
        var path = "/user-profiles" + "/" + file.filename;
        db.connectionPool.getConnection(function(err, connection) {
            if (err) { return res.status(500).send("An interval server error occurred."); }
            var query = "update User_Profile set profile_picture = ? where email = ?;";
            connection.query(query, [path, req.session.user.email], function (err, rows, fields) {
                connection.release();
                if (err) { return res.status(500).send("An interval server error occurred."); }

                // Update user session
                let userSession = req.session.user;
                userSession["profile_picture"] = path;
                req.session.user = userSession;

                return res.send("Successfully in changing profile picture!");
            });
        });
    });
});

router.post("/edit-profile", function (req, res, next) {
  // Ensure the user is logged in
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access!!");
  }
  // Get all data from request body
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Deference
    var { first_name, last_name, birthday, instagram_handle, facebook_handle, state, country } =
      req.body;
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
        req.session.user.email,
      ],
      function (err, rows, fields) {
        connection.release();
        if (err) {
          return res.status(500).send("An interval server error occurred.");
        }
        return res.send("Success in updating profile!");
      }
    );
  });
});

router.get("/get-profile", function (req, res, next) {
  if (!userIsLoggedIn(req.session.user)) {
    return res.status(401).send("Unauthorized Access !!");
  }
  db.connectionPool.getConnection(function (err, connection) {
    if (err) {
      return res.status(500).send("An interval server error occurred.");
    }
    // Get data
    var query = "select * from User_Profile where email = ?";
    connection.query(query, [req.session.user.email], function (err, rows, fields) {
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

// Rendering Pages
router.get("/profile", function (req, res, next) {
  if (!userIsLoggedIn(req.session.user)) {
    res.redirect("/");
  }
  res.sendFile(pathToHtml("profile.html"));
});

module.exports = router;
