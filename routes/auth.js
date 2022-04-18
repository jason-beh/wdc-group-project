var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var db = require('../utils/db');
const req = require('express/lib/request');

var router = express.Router();
passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.connectionPool.getConnection(function (err, connection) {
        if (err) {
            return cb(err);
        }
        var query = "SELECT * FROM users WHERE username = ?";
        connection.query(query, [username], function (err, rows, fields) {
            connection.release();
            if (err) { return cb(err); }
            if (!rows || rows.length == 0) { return cb(null, false, { message: 'Incorrect username or password.' }); }

            var user = rows[0];
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

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

router.post('/signup', function (req, res, next) {
    var salt = crypto.randomBytes(16);

    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
        if (err) { return next(err); }

        db.connectionPool.getConnection(function (err, connection) {
            if (err) {
                return next(err);
            }
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