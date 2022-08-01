const express = require('express');
const router = express.Router();
const fs = require('fs');
const superagent = require('superagent');
const cheerio = require('cheerio');
const twseUrl = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp";
router.get('/test', (req, res, next) => {
	res.json('test')
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



module.exports = router;
