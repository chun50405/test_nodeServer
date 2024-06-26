const express = require('express');
const router = express.Router();
const models = require('../models');
const config_env = require('../config_env');
const jwt = require('jsonwebtoken');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = config_env['GOOGLE_CLIENT_ID']
const client = new OAuth2Client();


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
			if(user.isVerified === false) {
				res.status(400).send({message: '帳號尚未通過認證', isVerified: false, email: user.email, account: user.account,token: generateToken(user)})
			} else {
				if(user.authenticate(password)) {
					let theToken = generateToken(user);
					res.json({ theToken });
				} else {
					res.status(400).send({message: '帳號或密碼錯誤'})
				}
			}

		} else {
			res.status(400).send({message: '帳號或密碼錯誤'})
		}


	} catch (e) {
		console.log('e=', e)
	 	res.status(500).send(e)
	}
})


router.post('/loginByGoogle', async (req, res, next) => {
	let body = req.body
	let token = body.idToken

	try {
		let verifiedToken = await verifyGoogleIdToken(token);
		if(verifiedToken) {
			let theToken = generateToken(body);
			res.json({ theToken });
		} else {
			throw new Error('Error verifying Google ID token');
		}


	} catch (e) {
		console.log('/user/loginByGoogle fail', e)
		res.status(500).send(e)
	}

})

router.post('/register', async (req, res, next) => {
	let body = req.body;
	console.log('body=', body)
	try {
		let findUser = await models.user.findOne({
			where: {account: body.account}
		})
		console.log('findUser=', findUser)
		if(findUser) {
			res.status(400).send({message: "此帳號已被存在，請使用其他帳號名稱"});
		} else {
		let createUser = await models.user.create({
				account: body.account,
				password: body.password,
				email: body.email,
				isVerified: false
			})
			console.log('createUser=', createUser)
			let token = generateToken(createUser);
			let mailTo = {
				email: body.email,
				name: body.account
			}
			console.log(token, mailTo);
			await sendMail(token, mailTo);

			res.send({message: '註冊成功，並已發送認證信至您的信箱，認證完成後即可登入'})
		}


	} catch (e) {
		console.log('e=', e)
		res.status(500).send(e);
	}
})


router.get('/verifyAccount', async (req, res, next) => {
	let query = req.query;
	let token = query.token;
	console.log('token=', token)
	try {
		let decoded = jwt.verify(token, config_env.JWT_SECRET);
		let user = decoded.user
		await models.user.update({isVerified: true}, {
			where: {id: user.id}
		})
		res.send({message: "認證成功"})
	} catch (error) {
		res.status(400).send(error)
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
		console.error(error);
		res.status(500).send(error)

	});
})

router.post('/reSendVerifyMail', async (req, res, next) => {
	let body = req.body
	let token = body.token
	let mailTo = {
		email: body.email,
		name: body.account
	}
	try {
		await sendMail(token, mailTo)		
		res.send({message: "已寄出認證信件"})
	} catch (error) {
		res.status(500).send(error)
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
	try {
		let user = req.auth.user;

		let theToken = generateToken(user);
		res.json({ theToken });
	} catch (error) {
		console.error(error)
		res.status(500).send(error)
	}

})

function generateToken(user, expireDays){

	let userForToken = user;
	let expiresIn = 60 * 60 * 12; // 12 hours


	if(expireDays){
		expiresIn = expireDays * 24 * 60 * 60;
	}


	let token = jwt.sign({
		user: user
	}, config_env.JWT_SECRET, {
		// expiresIn: expiresIn // in seconds
		expiresIn: expiresIn
	});
	return token;
}

async function sendMail(token, mailTo) {
	let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
	let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
	//先固定為自已
	const sender = {"name":"Wade Wu","email":"chun50405@gmail.com"}


	sendSmtpEmail.subject = "{{params.subject}}";
	sendSmtpEmail.htmlContent = `
		<html>
		 <body>
		  <a href="{{params.verifyUrl}}">{{params.verifyUrl}}</a>
		 </body>
		</html>
	`
	sendSmtpEmail.sender = sender;
	sendSmtpEmail.to = [mailTo];
	sendSmtpEmail.replyTo = sender;
	sendSmtpEmail.params = {
	"verifyUrl":`http://localhost:4200/user/verifyAccount?token=${token}`,
	"subject":"帳號認證",
};

	return apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
	  console.log('API called successfully. Returned data: ' + JSON.stringify(data));
		return data
	}, function(error) {
		console.log('error=>', error)
		throw error
	});
}

async function verifyGoogleIdToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const userId = payload.sub;

    console.log('User ID:', userId);
    console.log('User Name:', payload.name);
    console.log('User Email:', payload.email);

    // 如果需要，您还可以进行其他检查
    // 例如，检查'iss'（發行者）字段以確保令牌来自Google
    if (payload.iss !== 'https://accounts.google.com') {
      throw new Error('Invalid token: Issuer is not Google.');
    }

    return true;
  } catch (error) {
    console.error('Error verifying Google ID token:', error.message);
    return false;
  }
}


module.exports = router;
