const express = require('express');
const router = express.Router();
const models = require('../models');

router.get('/test', (req, res, next) => {
	res.json('/user/test')
})

router.post('/addUser',async (req, res, next) => {
	let body = req.body

	try {
		let user =  await models.user.create({
			account: body.account,
			password: body.password
		})
		res.json(user)
	} catch (e) {
		res.status(500).json(e)
	}
})

router.post('/login', async (req, res, next) => {
	let body = req.body
	let account = body.account
	let password = body.password
	try {
		let user = await models.user.findOne({
			where: {
				account: account
			}
		})

		if(user) {
			if(user.authenticate(password)) {
				res.json('登入成功');
			} else {
				res.status(400).json('帳號或密碼錯誤')
			}
		} else {
			res.status(400).json('帳號或密碼錯誤')
		}


	} catch (e) {
		console.log('e=', e)
	 	res.status(500).send(e)
	}
})

router.get('/list', async (req, res, next) => {


	try {
		let result = await models.user.findAll()

		res.json(result)
	} catch (e) {
		res.status(500).json(e)
	}

})
module.exports = router;
