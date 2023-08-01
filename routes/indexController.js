const express = require('express');
const router = express.Router();
const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = sequelize.Op;
const cluster = require('cluster');
const fs = require('fs');
const path = require('path');
const config_env = require('../config_env');
const fullPath = path.join(__dirname, "../", config_env.ANGULAR_APP_PATH);
router.get('/', (req, res, next) => {
	// // const workerId = cluster.worker.id;
	// console.log(Math.random());
  // // res.json({ workerId: workerId, message: 'Hello from worker ' + workerId , num: Math.random()});
	// res.json({num: Math.random()})
	if (fs.existsSync(fullPath)) {
	  res.redirect('/app/');
	} else {
		res.send("Hello World")
	}

})




module.exports = router;
