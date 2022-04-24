// ==========================================================================================
//  User Authentication Component
// ==========================================================================================
/* 
    Date: 2022-04-18
    The implementation of user authentication component utilizes passport.js library.
    Reference: https://www.passportjs.org/packages/passport-local/
    Functionalities: Sign up / Login / Verify password / Log out
*/

var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var db = require('../utils/db');
var argon2 = require('argon2');

var router = express.Router();

// TODO: users must logout first before logging in or signing up again

// Verify Password
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function verify(email, password, cb) {
    // Connect to the database
    db.connectionPool.getConnection(function (err, connection) {
        if (err) { return cb(err); }
        // Query the database
        var query = "SELECT * FROM Authentication WHERE email = ?";
        connection.query(query, [email], function (err, rows, fields) {
            connection.release();
            if (err) { return cb(err); }
            if (!rows || rows.length == 0) { return cb(null, false, { message: 'Incorrect email or password.' }); }
            // Verify the hashed password
            var user = rows[0];
            // Table types: email---varchar(255) | password,varbinary(255) | salt,varbinary(255)
            argon2.verify(user["password"], password).then(function () {
                return cb(null, rows);
            }).catch(function (err) {
                return cb(null, false, { message: 'Incorrect email or password.' });
            });
        });
    });
}));


// create session
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        // Bug fixed: 'users' becomes an array
        cb(null, { email: user[0].email });
    });
});


// read from session
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


// process the form on the login page
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));


router.post('/signup', function (req, res, next) {
    // hashing the password    
    argon2.hash(req.body.password).then(function (hashedPassword) {
        db.connectionPool.getConnection(function (err, connection) {
            if (err) { return next(err); }
            // Check if user exists
            var query = "SELECT * FROM Authentication WHERE email = ?";
            connection.query(query, [req.body.email], function (err, rows, fields) {
                if (err) { return next(err); }
                if (rows && rows.length == 1) { return next("The user already exists! ERROR!!!"); }
            });
            // Query the database
            query = "INSERT INTO Authentication (email, password) VALUES (?, ?)";
            connection.query(query, [req.body.email, hashedPassword], function (err) {
                if (err) { return next(err); }
                var user = {
                    id: this.lastID,
                    email: req.body.email
                };
                req.login(user, function (err) {
                    if (err) { return next(err); }
                    res.redirect('/');
                });
            });
            // Create user profile
            query = "insert into User_Profile (email) values (?)";
            connection.query(query, [req.body.email], function (err) {
                connection.release();
                if (err) { return next(err); }
            });
        });
    }).catch(function (err) {
        return next(err);
    });
});

// TODO: change to POST later
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/check', function (req, res, next) {
    res.send(req.user);
});

module.exports = router;