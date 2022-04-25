var express = require('express');
const { userIsLoggedIn, userIsAdmin } = require('../utils/auth');
var db = require('../utils/db');
var argon2 = require('argon2');

var router = express.Router();

router.get('/view-events', function(req, res, next) {
    // Ensure the admin is logged in
    if (!userIsAdmin(req.user)) {
        return res.status(401).send('Unauthorized Access!');
    }
    db.connectionPool.getConnection(function(err, connection) {
        if (err) { return next(err); }
        var query = "SELECT * from Events";
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            return res.send(rows);
        });
    });
});

router.get('/view-users', function(req, res, next) {
    // Ensure the admin is logged in
    if (!userIsAdmin(req.user)) {
        return res.status(401).send("Unauthorized Access!");
    }
    db.connectionPool.getConnection(function(err, connection) {
        if (err) { return next(err); }
        var query = "SELECT * from Authentication";
        connection.query(query, function(err, rows, fields){
            connection.release();
            if (err) { return next(err); }
            return res.send(rows);
        });
    });
});

router.post('/create-admins', function (req, res, next) {
    if (!userIsAdmin(req.user)) {
        return res.status(401).send("Unauthorized Access!");
    }

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
            query = "INSERT INTO Authentication (email, password, isAdmin) VALUES (?, ?, 1)";
            connection.query(query, [req.body.email, hashedPassword], function (err) {
                if (err) { return next(err); }
                var user = {
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

module.exports = router;