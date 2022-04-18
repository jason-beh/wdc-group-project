var mysql = require('mysql');
var options = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'social',
};

var connectionPool = mysql.createPool(options);

exports.options = options;
exports.connectionPool = connectionPool;