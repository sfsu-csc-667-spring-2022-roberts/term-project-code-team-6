const express = require('express');
const authUser = require('../middleware/isAuth');
const router = express.Router();
const db = require('../db');

/* GET home page. */
router.get('/', authUser, async function (req, res, next) {
	let query = 'SELECT id, "userCount" FROM games;';
	const games = await db.manyOrNone(query, []);
	query = 'SELECT COUNT(id) FROM games;'
	const {count} = await db.one(query, []);
	console.log(games);
	console.log(count)
	res.render('index', { title: 'UNO', games: games, count: count });
});

/* GET how to play page. */
router.get('/how-to-play', function (req, res, next) {
	res.render('how-to');
});

router.get('/login', function (req, res, next) {
	res.render('login');
});

router.get('/signup', function (req, res, next) {
	res.render('signup');
});

router.get('/terms&conditions', function (req, res, next) {
	res.render('terms&conditions');
});

module.exports = router;
