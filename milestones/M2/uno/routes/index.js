const express = require('express');
const authUser = require('../middleware/isAuth');
const router = express.Router();
const db = require('../db');
const isAuth = require('../middleware/isAuth');

/* GET home page. */
router.get('/', authUser, async function (req, res) {
	let query = 'SELECT id, "userCount" FROM games;';
	const games = await db.manyOrNone(query, []);
	console.log(games);
	res.render('index', { title: 'UNO', games: games, count: games.length });
});

router.get('/login', function (req, res) {
	res.render('login');
});

router.get('/signup', function (req, res) {
	res.render('signup');
});

router.get('/terms&conditions', function (req, res) {
	res.render('terms&conditions');
});

router.get('/userInfo', isAuth, async function (req, res) {
	const userId = req.session.userId;
	let query = 'SELECT username FROM users WHERE id = $1';
	const fetchedUser = await db.one(query, [userId]);
	console.log(fetchedUser);
	res
		.status(200)
		.json({ uid: req.session.userId, username: fetchedUser.username });
});

module.exports = router;
