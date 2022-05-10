var express = require('express');
var router = express.Router();

var path = require('path');
const { userIsLoggedIn } = require('../utils/auth');
const { pathToHtml } = require('../utils/routes');

router.get('/test-db', function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    const query = 'SHOW TABLES';
    connection.query(query, function (err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});

// Rendering Pages
router.get('/', function (req, res, next) {
  res.sendFile(pathToHtml('index.html'));
});

router.get('/nav', function (req, res, next) {
  res.sendFile(pathToHtml('nav.html'));
});

module.exports = router;
