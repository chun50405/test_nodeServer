#!/usr/bin/env node
const app = require('../app');
const debug = require('debug')('web:server');
const http = require('http');
const env = process.env.NODE_ENV || 'development';
const commonConfig = require('../config/startConfig')['common'];
const startConfig = require('../config/startConfig')[env];

const models = require('../models');
const sequelize = models.sequelize;
const fs = require('fs')
const cluster = require('cluster');
const os = require('os');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '5679');
app.set('port', port);

/**
 * Create HTTP server.
 */


 if(startConfig.useHttps){
   let HTTPS_CONFIG = startConfig.httpsConfig;
   let path = require('path');
   let certDir = HTTPS_CONFIG.certDir;
   let ca = [];
   let server_key = path.join(__dirname, certDir, HTTPS_CONFIG.key)
   let server_cert = path.join(__dirname, certDir,HTTPS_CONFIG.cert)
   if(fs.existsSync(server_key) && fs.existsSync(server_cert)) {
     for(let idx in HTTPS_CONFIG.ca){
       let caFile = HTTPS_CONFIG.ca[idx];
       let server_ca = path.join(__dirname, certDir, caFile)
       if(fs.existsSync(server_ca)) {
         ca.push(fs.readFileSync(server_ca))
       }
     }
     server = require('https').createServer({
       key: fs.readFileSync(server_key),
       cert: fs.readFileSync(server_cert),
       // passphrase: HTTPS_CONFIG.passphrase,
       // ca: ca,
       // secureOptions: crypto.constants.SSL_OP_NO_TLSv1 | crypto.constants.SSL_OP_NO_TLSv1_1
     }, app);
     console.log('USE HTTPS');
   } else {
     console.log('no key & cert File')
     server = require('http').createServer(app);
   }

 }else{
   server = require('http').createServer(app);
 }
//
if(cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });

  sequelize.sync({force: false })
  .then(function(){
   console.log('testServer port =', port)
   console.log('Sequelize table create ok!')
  })
  .catch((error) => {
    console.log('error=', error)
  })
} else {
  server.listen(port, function() {
   debug('Express server listening on port ' + server.address().port);
  });
}




/**
 * Listen on provided port, on all network interfaces.
 */
// ******************************** 手動新增 S ************************************
// sequelize.sync({force: false })
// .then(function(){
//  console.log('testServer port =', port)
//  console.log('Sequelize table create ok!')
//
//  server.listen(port, function() {
//   debug('Express server listening on port ' + server.address().port);
//  });
// })
// .catch((error) => {
//   console.log('error=', error)
// })
// ******************************** 手動新增 E ************************************

//server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
