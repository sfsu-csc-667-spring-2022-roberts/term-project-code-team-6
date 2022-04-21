const express = require('express');
const authUser = require('../middleware/isAuth');
const router = express.Router();
const db = require('../db');
const isAuth = require('../middleware/isAuth');

/* GET home page. */
router.get('/', authUser, async function (req, res, next) {
	let query = 'SELECT id, "userCount" FROM games;';
	const games = await db.manyOrNone(query, []);
	query = 'SELECT COUNT(id) FROM games;';
	const { count } = await db.one(query, []);
	console.log(games);
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

router.get('/userInfo', isAuth, async function (req, res, next) {
	const userId = req.session.userId;
	let query = 'SELECT username FROM users WHERE id = $1';
	const fetchedUser = await db.one(query, [userId]);
	console.log(fetchedUser);
	res
		.status(200)
		.json({ uid: req.session.userId, username: fetchedUser.username });
});

module.exports = router;
