const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const superagent = require('superagent');
const cheerio = require('cheerio');
const twseUrl = "https://mis.twse.com.tw";
const twseOpenAIUrl = "https://openapi.twse.com.tw";
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
		// console.log('$$$$$', $.root().html())
		const data = []
		$('p.list-title').each((i, elem) => {
			// console.log(i, elem)
			
			const title = $(elem).children('a').attr('title');
			const href = $(elem).children('a').attr('href');
			const url = 'https://news.cnyes.com' + href
			data.push({title: title, url: url})
		})
		// $('div[class="_2bFl theme-list"] div[style="height:70px;"]').each( (i, elem) => {
		// 	console.log('i, elem=>', i, elem)
		// 	const title = $(elem).children('a').attr('title')
		// 	const href = $(elem).children('a').attr('href')
		// 	const url = 'https://news.cnyes.com' + href
		// 	const ahtml = $(elem).children('a').html();
		// 	const time = $(ahtml).children('time').text()
		// 	const subTitle = $(ahtml).children('.theme-sub-cat').text()
		// 	const image = $(ahtml).children('figure').children('img').attr('src');
		// 	console.log({title: title, time: time, subTitle: subTitle, url: url, image: image})
		// 	data.push({title: title, time: time, subTitle: subTitle, url: url, image: image})
		// })
		res.json(data)
	} catch (e) {
		console.log('/news error =>',e)
		res.status(500).json(e)
	}
})

router.get('/newsContent', async (req, res, next) => {
	let query = req.query
	let url = query.url
	try {
    const result = await superagent.get(url);
    const $ = cheerio.load(result.text);

		const article = $('article').text();

    res.send({content: article})
  } catch (e) {
    console.log('/newContent error =>', e);
    res.status(500).send(e)
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
