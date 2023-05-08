const express = require('express');
const router = express.Router();
const models = require('../models');
const jwt = require('jsonwebtoken');
const JWT_PASSWORD = 'wade'

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
				let theToken = generateToken(user);
				res.json({ theToken });
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

router.get('/refreshToken', async (req, res, next) => {
	let user = req.auth.user;

	let theToken = generateToken(user);
	res.json({ theToken });
})

function generateToken(user, expireDays){

	let userForToken = user;
	let expiresIn = 15 * 60; // 15min


	if(expireDays){
		expiresIn = expireDays * 24 * 60 * 60;
	}


	let token = jwt.sign({
		user: user
	}, JWT_PASSWORD, {
		// expiresIn: expiresIn // in seconds
		expiresIn: expiresIn
	});
	return token;
}



module.exports = router;
