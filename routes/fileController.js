const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');

router.get('/test', (req, res, next) => {
	res.json('test')
})

router.post('/uploadImage', (req, res, next) => {


	const form = formidable({ multiples: true, uploadDir: __dirname} );
	console.log('form=', form)
	form.parse(req, (err, fields, files) => {
		if(err) {
			// res.status(400).json(err)
			console.log('err=', err)
		}
		// let file = fields.file
		// let type = fields.type
		// const buffer = Buffer.from(file, "base64");

		fs.writeFileSync(files.file.newFilename + '.' + fields.type, fs.readFileSync(files.file.filepath));
		console.log({ fields, files })
		res.json({ fields, files });
	})
})

router.post('/uploadVideo', (req, res, next) => {

	const form = formidable({ multiples: true, uploadDir: __dirname} );
	console.log('form=', form)
	form.parse(req, (err, fields, files) => {
		if(err) {
			// res.status(400).json(err)
			console.log('err=', err)
		}
		console.log({ fields, files })

		fs.writeFileSync(files.file.originalFilename, fs.readFileSync(files.file.filepath));
		res.json({ fields, files });
	})
})


module.exports = router;
