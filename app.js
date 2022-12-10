const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
let dotenv = require("dotenv").config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const team1Router = require('./routes/team1.1');
const GraphDB = require("./util/GraphDB.js");

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/team1.1', team1Router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

(async () => {
  global.graphdb = await GraphDB.connect(
      {
        https: true,
        host: dotenv.parsed.GRAPHDB_DOMAIN,
        repository: dotenv.parsed.GRAPHDB_REPOSITORY,
        port: dotenv.parsed.GRAPHDB_PORT,
      },
      dotenv.parsed.GRAPHDB_USER,
      dotenv.parsed.GRAPHDB_PASSWORD
  );

})();

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
