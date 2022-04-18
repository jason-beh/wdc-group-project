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
var crypto = require('crypto');
var db = require('../utils/db');
const req = require('express/lib/request');

var router = express.Router();


// Verify Password
passport.use(new LocalStrategy(function verify(username, password, cb) {
    // Connect to the database
    db.connectionPool.getConnection(function (err, connection) {
        if (err) { return cb(err); }
        // Query the database
        var query = "SELECT * FROM users WHERE username = ?";
        connection.query(query, [username], function (err, rows, fields) {
            connection.release();
            if (err) { return cb(err); }
            if (!rows || rows.length == 0) { return cb(null, false, { message: 'Incorrect username or password.' }); }
            // Verify the hashed password
            var user = rows[0];
            // Table types: username---varchar(255) | hashed_password,varbinary(255) | salt,varbinary(255)
            crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
                if (err) { return cb(err); }
                if (!crypto.timingSafeEqual(user['hashed_password'], hashedPassword)) {
                    return cb(null, false, { message: 'Incorrect username or password.' });
                }
                return cb(null, rows);
            });
        });
    });
}));


passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
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
    var salt = crypto.randomBytes(16); // generate the salt for hashing
    // hashing the password
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
        if (err) { return next(err); }
        // Connect to the database
        db.connectionPool.getConnection(function (err, connection) {
            if (err) { return next(err); }
            // Query the database
            var query = "INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)";
            connection.query(query, [req.body.username, hashedPassword, salt], function (err) {
                connection.release();
                if (err) { return next(err); }
                var user = {
                    id: this.lastID,
                    username: req.body.username
                };
                req.login(user, function (err) {
                    if (err) { return next(err); }
                    res.redirect('/');
                });
            });
        });
    });
});


router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

module.exports = router;