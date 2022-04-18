var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test-db', function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
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

module.exports = router;
