const express = require('express');
const router = express.Router();
const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = sequelize.Op;
router.get('/', (req, res, next) => {
	res.json('Welcome!!!')
})




module.exports = router;
