const express = require('express');
const router = express.Router();
const models = require('../models');
const config_env = require('../config_env');
const jwt = require('jsonwebtoken');
const SibApiV3Sdk = require('sib-api-v3-sdk');
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = config_env.SENDINBLUE_API_KEY;

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

router.post('/register', async (req, res, next) => {
	let body = req.body;

	try {
		let findUser = await models.user.findOne({
			where: {account: body.account}
		})

		if(findUser) {
			res.status(400).send("此帳號已被存在，請更換其他帳號名稱");
		}


	} catch (e) {

	}
})




router.post('/sendVerifyMail', async (req, res, next) => {

	let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
	let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	sendSmtpEmail.subject = "My {{params.subject}}";
	sendSmtpEmail.htmlContent = "<html><body><h1>This is my first transactional email {{params.parameter}}</h1></body></html>";
	sendSmtpEmail.sender = {"name":"Wade Wu","email":"chun50405@gmail.com"};
	sendSmtpEmail.to = [{"email":"wade@viewlead.com.tw","name":"WADE"}];
	sendSmtpEmail.replyTo = {"name":"Wade Wu","email":"chun50405@gmail.com"};
	sendSmtpEmail.headers = {"Some-Custom-Name":"unique-id-1234"};
	sendSmtpEmail.params = {"parameter":"My param value","subject":"New Subject"};

	apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
	  console.log('API called successfully. Returned data: ' + JSON.stringify(data));
		res.send(data)
	}, function(error) {
		res.status(500).send(error)
	  console.error(error);
	});
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

function sendMail() {
	new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(
	  {
	    'subject':'Hello from the Node SDK!',
	    'sender' : {'email':'chun50405@gmail.com', 'name':'Wade'},
	    'replyTo' : {'email':'chun50405@gmail.com', 'name':'Wade'},
	    'to' : [{'name': 'John Doe', 'email':'chun50405@gmail.com'}],
	    'htmlContent' : '<html><body><h1>This is a transactional email {{params.bodyMessage}}</h1></body></html>',
	    'params' : {'bodyMessage':'Made just for you!'}
	  }
	)
}

module.exports = router;
