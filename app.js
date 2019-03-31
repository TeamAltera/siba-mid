var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hubRouter = require('./routes/hub');
var userRouter = require('./routes/user');
var apRouter = require('./routes/ap');
var app = express();
var cors = require('cors');
var apService = require('./services/ap-services');
var nodeCleanup = require('node-cleanup');

global.loggerFactory = require('./config/logger'); //logger factory 생성

//cors 설정
app.use(cors({
  'allowedHeaders': ['sessionId', 'Content-Type', 'Authorization'],
  'exposedHeaders': ['sessionId'],
  'origin': '*',
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/hub', hubRouter);
app.use('/user', userRouter);
app.use('/ap', apRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//when process clean up then call
nodeCleanup((exitCode, signal)=>{
  apService.disable();
});

module.exports = app;
