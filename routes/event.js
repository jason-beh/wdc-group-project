var express = require('express');
var passport = require('passport');
var db = require('../utils/db');
var objects = require('../utils/objects');
var path = require('path');
const { userIsLoggedIn } = require('../utils/auth');
const { pathToHtml } = require('../utils/routes');

var router = express.Router();

router.post('/create-event', function (req, res, next) {
    // Ensure an user is logged in
    if(!userIsLoggedIn(req.user)) {
        return res.status(401).send('Unauthorized Access!!');
    }
    // Get all data from request body
    db.connectionPool.getConnection(function (err, connection) {
        if (err) { return next(err); }
        // Deference
        var { title, description, proposal_date, start_date, end_date, address_line, state, country, postcode } = req.body;
        var query = "INSERT INTO Events (title, description, created_by, proposal_date, start_date, end_date, custom_link, address_line, state, country, postcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        connection.query(query, [title, description, req.user.email, proposal_date, start_date, end_date, req.url, address_line, state, country, postcode], function (err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            return res.send("Success in creating an event");
        });
    });
});

router.post('/edit-event', function (req, res, next) {
    // Ensure an user is logged in
    if(!userIsLoggedIn(req.user)) {
        return res.status(401).send('Unauthorized Access!!');
    }
    db.connectionPool.getConnection(function(err, connection) {
        if (err) {return next(err); }
        var { title, description, proposal_date, start_date, end_date, address_line, state, country, postcode, event_id } = req.body;
        var query = "UPDATE Events set title = ?, description = ?, proposal_date = ?, start_date = ?, end_date = ?, address_line = ?, state = ?, country = ?, postcode = ? where event_id = ?";
        connection.query(query, [title, description, proposal_date, start_date, end_date, address_line, state, country, postcode, event_id], function(err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            return res.send("Success in modifying the event!");
        });
    });
});

router.delete('/delete-event', function(req, res, next) {
    // Ensure an user is logged in
    if (!userIsLoggedIn(req.user)) {
        return res.status(401).send('Unauthorized Access!!');
    }
    db.connectionPool.getConnection(function(err, connection) {
        if (err) { return next(err); }
        var {event_id} = req.body;
        var query = "DELETE from Events where event_id = ?";
        connection.query(query, [event_id], function(err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            return res.send("Success in deleting an event!");
        });
    });
});

router.get('/my-events/organized', function(req, res, next) {
    // Ensure an user is logged in
    if(!userIsLoggedIn(req.user)) {
        return res.status(401).send('Unauthorized Access!!');
    }
    db.connectionPool.getConnection(function (err, connection) {
        if (err) { return next(err); }
        var query = "SELECT * FROM Events WHERE created_by = ?";
        connection.query(query, [req.user.email], function (err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            return res.send(rows);
        });
    });
});

router.get('/my-events/attended', function(req, res, next) {
    // Ensure an user is logged in
    if (!userIsLoggedIn(req.user)) {
        return res.status(401).send("Unauthorized Access!!");
    }
    db.connectionPool.getConnection(function (err, connection) {
        if (err) { return next(err); }
        var query = "select title, description, proposal_date, start_date, end_date, custom_link, address_line, state, country, postcode from Events inner join Attendance where Attendance.email = ? && Attendance.event_id = Events.event_id";
        connection.query(query, [req.user.email], function (err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            return res.send(rows);
        });
    });
});

// Rendering Pages
router.get('/create-event', function(req, res, next) {
    if (!userIsLoggedIn(req.user)) {
        res.redirect('/login');
    }
    res.sendFile(pathToHtml('create-event.html'));
});

router.get('/edit-event', function(req, res, next) {
    if (!userIsLoggedIn(req.user)) {
        res.redirect('/login');
    }
    res.sendFile(pathToHtml('edit-event.html'));
});

module.exports = router;