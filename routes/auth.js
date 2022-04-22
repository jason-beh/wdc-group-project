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


// Verify Password
passport.use(new LocalStrategy(function verify(email, password, cb) {
    // Connect to the database
    console.log(email);
    console.log(password);
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
            console.log(user);
            // Table types: email,varchar(255) | password,varchar(255)
            argon2.verify(user["password"], password).then(function() {
                return cb(null, rows);
            }).catch(function() {
                return cb(null, false, { message: 'Incorrect email or password.' });
            });
        });
    });
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, email: user.email });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

router.get('/login', function (req, res, next) {
    res.render('login');
});

// process the form on the login page
router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

router.post('/signup', function (req, res, next) {
    // hashing the password    
    argon2.hash(req.body.password).then(function(password) {
        db.connectionPool.getConnection(function (err, connection) {
            if (err) { return next(err); }
            // Query the database
            var query = "INSERT INTO Authentication (email, password) VALUES (?, ?)";
            connection.query(query, [req.body.email, password], function (err) {
                connection.release();
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
        });
    }).catch(function(err) {
        return next(err);
    });
});


router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

module.exports = router;