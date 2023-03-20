const express = require('express');
const router = express.Router();
const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = sequelize.Op;
const cluster = require('cluster');
router.get('/', (req, res, next) => {
	// const workerId = cluster.worker.id;
	console.log(Math.random());
  // res.json({ workerId: workerId, message: 'Hello from worker ' + workerId , num: Math.random()});
	res.json({num: Math.random()})
})




module.exports = router;
