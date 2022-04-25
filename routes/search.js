var express = require('express');
var db = require('../utils/db');

var router = express.Router();

router.get('/search', function(req, res, next) {
    db.connectionPool.getConnection(function(err, connection) {
        if (err) { return next(err); }
        var {search_content} = req.body;
        var query = `SELECT title, description, proposal_date, start_date, end_date, custom_link, address_line, state, country, postcode from Events WHERE title LIKE '%${search_content}%'`;
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {return next(err); }
            return res.send(rows);
        });
    });
});


module.exports = router;