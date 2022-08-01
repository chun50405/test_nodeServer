const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileController = require('./routes/fileController');
const userController = require('./routes/userController');
const indexController = require('./routes/indexController');
const stockController = require('./routes/stockController');
const STARTCONFIG = require('./config/startConfig')["common"];

// ----------------------- 固定會用的套件 S ----------------------- /
const _ = require('lodash');

// ----------------------- 固定會用的套件 E ----------------------- /





const env = process.env.NODE_ENV || 'development';
const CONFIG = require('./config/config')[env];
const models = require('./models');

// ******************************************************************************
// ******************************** 手動新增 E ***********************************
// ******************************************************************************

const app = express();
const cors = require('cors');


app.use(logger('dev'));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.use(cors())
app.use('/file', fileController);
app.use('/user', userController);
app.use('/', indexController);
app.use('/stock', stockController);



app.set('view engine', 'pug')
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;
