var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var db = require('../utils/db');
var argon2 = require('argon2');
const { userIsLoggedIn } = require('../utils/auth');
const { pathToHtml } = require('../utils/routes');

var router = express.Router();

router.post('/edit-profile', function (req, res, next) {
    // Ensure the user is logged in
    if (!req.user) {
        return res.status(401).send('Unauthorized Access!!');
    }
    // Get all data from request body
    db.connectionPool.getConnection(function (err, connection) {
        if (err) { return next(err); }
        // Deference
        var { first_name, last_name, birthday, instagram_handle, facebook_handle, state, country } = req.body;
        // Update data
        var query = "update User_Profile set first_name = ?, last_name = ?, birthday = ?, instagram_handle = ?, facebook_handle = ?, state = ?, country = ? where email = ?";
        connection.query(query, [first_name, last_name, birthday, instagram_handle, facebook_handle, state, country, req.user.email], function (err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            return res.send("Success in updating profile!");
        });
    });
});

router.get('/get-profile', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized Access !!'); 
    }
    db.connectionPool.getConnection(function (err, connection) {
        if (err) { return next(err); }
        // Get data
        var query = "select * from User_Profile where email = ?";
        connection.query(query, [req.user.email], function (err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            // check
            if (!rows && rows.length == 0) {
                return res.send("User not found!");
            }
            return res.send(rows[0]);
        });
    });
});

// Rendering Pages
router.get('/profile', function(req, res, next) {
    if (!userIsLoggedIn(req.user)) {
        res.redirect('/');
    }
    res.sendFile(pathToHtml('profile.html'));
});

module.exports = router;