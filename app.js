const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { expressjwt: expressjwt } = require("express-jwt");
const helmet = require("helmet");
const axios = require('axios');
const fs = require('fs');

const fileController = require('./routes/fileController');
const userController = require('./routes/userController');
const indexController = require('./routes/indexController');
const stockController = require('./routes/stockController');
const STARTCONFIG = require('./config/startConfig')["common"];
const config_env = require('./config_env');
const fullPath = path.join(__dirname,config_env.ANGULAR_APP_PATH);
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
//部署 Angular 專案
if (fs.existsSync(fullPath)) {
  // 在這裡提供靜態檔案
  app.use("/app", express.static(fullPath));
}
app.use(cookieParser());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:["'self'", "'unsafe-inline'", "https://accounts.google.com/gsi/style"],
      frameSrc: ["'self'", "https://accounts.google.com/gsi/ "],
      scriptSrc: ["'self'", "https://accounts.google.com/gsi/client"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://accounts.google.com/gsi/"]
    }
  },
  referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "same-site" },
}));
app.use(expressjwt({
    secret: config_env.JWT_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    },
    onExpired: async (req, err) => {
      console.log('err=', err);
      // console.log('req=', req);

      // if (new Date() - err.inner.expiredAt < 5000) { return;}
      throw err;
    },
  }).unless({ path: ['/',/^\/app\?*/,'/user/login', '/user/loginByGoogle', '/user/sendVerifyMail', '/user/register', '/ipaDownload'] }));

app.use(function (err, req, res, next) {
  console.error(err);
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token...");
  } else {
    next(err);
  }
});

app.use('/', indexController);
app.use('/file', fileController);
app.use('/user', userController);
app.use('/stock', stockController);

// const twseUrl = "https://mis.twse.com.tw";
// const twseOpenAIUrl = "https://openapi.twse.com.tw";
// app.get('/stock/api/getStockInfo.jsp', async (req, res, next) => {
//   let query = req.query
//
//     try {
//       const response = await axios.get(`${twseUrl}/stock/api/getStockInfo.jsp`, {
//         params: query
//       });
//       // console.log('response=', response)
//       res.send(response.data)
//     } catch (error) {
//       console.error(error);
//       res.status(400).send(error)
//
//     }
// })


//Angular 專案 開頭的 /app都回傳 index.html
app.get('/app/*', (req, res) => {
  if (fs.existsSync(fullPath)) {
    res.sendFile(path.resolve(fullPath, 'index.html'));
  }
});




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
