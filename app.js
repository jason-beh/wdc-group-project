var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
// module1 for storing Session in MySQL Database
var mysqlStore = require('express-mysql-session')(session);

var db = require('./utils/db');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var profileRouter = require('./routes/profile');
var eventRouter = require('./routes/event');
var availabilityRouter = require('./routes/availability');
var searchRouter = require('./routes/search');
var adminRouter = require('./routes/admin')

// module2 for storing Session in MySQL Database
var sessionStore = new mysqlStore(db.options);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// configure Passport to manage the login session
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  // Reference: https://darifnemma.medium.com/how-to-store-session-in-mysql-database-using-express-mysql-session-ae2f67ef833e
  store: sessionStore // storing Session in MySQL Database
}));
app.use(passport.authenticate('session'));


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


app.use(function (req, _, next) {
  req.pool = db.connectionPool;
  next();
});


app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', eventRouter);
app.use('/', availabilityRouter);
app.use('/', searchRouter);
app.use('/', adminRouter);


module.exports = app;
