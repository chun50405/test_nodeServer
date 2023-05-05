const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const superagent = require('superagent');
const cheerio = require('cheerio');
const twseUrl = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp";
router.get('/test', (req, res, next) => {
	let random = Math.random()
	console.log('req=', req.auth)
	res.json({message: 'test', random: random})
})


router.get('/news', async (req, res, next) => {
	const newsUrl = 'https://news.cnyes.com/news/cat/headline'

	try {
		const result = await superagent.get(newsUrl)
		const $ = cheerio.load(result.text)
		const data = []

		$('div[class="_2bFl theme-list"] div[style="height:70px;"]').each((i, elem) => {
			const title = $(elem).children('a').attr('title')
			const href = $(elem).children('a').attr('href')
			const ahtml = $(elem).children('a').html();
			const time = $(ahtml).children('time').text()
			const subTitle = $(ahtml).children('.theme-sub-cat').text()
			data.push({title: title, time: time, subTitle: subTitle, url: 'https://news.cnyes.com' + href})
		})
		res.json(data)
	} catch (e) {
		console.log('e=',e)
		res.status(500).json(e)
	}
})

router.get('/getStockGroup', async (req, res, next) => {
	try {
		let result = await fs.readFile('./json/groupStock.json');

		res.send(JSON.parse(result));
	} catch (e) {
		console.log('e=', e)
		res.status(500).send(e)
	}

})

router.put('/editStockGroup', async (req, res, next) => {
	try {
		let body = req.body;
		let jsonData = body.jsonData;
		let groupName = body.groupName;
		let theStockGroup = await fs.readFile('./json/groupStock.json');

		let data = JSON.parse(theStockGroup)
		data[groupName] = jsonData

		await fs.writeFile('./json/groupStock.json', JSON.stringify(data));
		res.send({message: 'writeFile Success'});
	} catch (e) {
		console.log('e=', e)
		res.status(500).send(e);
	}
})

module.exports = router;
