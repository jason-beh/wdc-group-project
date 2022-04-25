var express = require('express');
var db = require('../utils/db');
const { userIsLoggedIn } = require('../utils/auth');
const { pathToHtml } = require('../utils/routes');

var router = express.Router();

router.post('/get-all-availability', function (req, res, next) {
    // Ensure an user is logged in
    if(!userIsLoggedIn(req.user)) {
        return res.status(401).send('Unauthorized Access!!');
    }
    db.connectionPool.getConnection(function(err, connection) {
        if (err) {return next(err); }
        var { event_id } = req.body;
        var query = "SELECT * from Availability WHERE event_id = ? AND email = ?";
        connection.query(query, [event_id, req.user.email], function(err, rows, fields) {
            connection.release();
            if (err) { return next(err); }
            return res.send(rows);
        });
    });
});

// router.post('/specify-availability', function (req, res, next) {
//     // Ensure an user is logged in
//     if(!userIsLoggedIn(req.user)) {
//         return res.status(401).send('Unauthorized Access!!');
//     }
//     db.connectionPool.getConnection(function(err, connection) {
//         if (err) {return next(err); }
//         var { event_id, start_date, end_date } = req.body;
//         var query = "INSERT INTO Availability VALUES (?, ?, ?, ?);";
//         connection.query(query, [req.user.email, event_id, start_date, end_date], function(err, rows, fields) {
//             connection.release();
//             if (err) { return next(err); }
//             return res.send("Success in specifying availability");
//         });
//     });
// });

module.exports = router;