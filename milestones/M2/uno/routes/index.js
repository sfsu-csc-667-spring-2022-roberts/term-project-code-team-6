const express = require('express');
const authUser = require('../middleware/isAuth');
const router = express.Router();

/* GET home page. */
router.get('/', authUser, function (req, res, next) {
	console.log(req.locals)
	res.render('index', { title: 'Express', teamNumber: 'D' });
});

/* GET how to play page. */
router.get('/how-to-play', function (req, res, next) {
	res.render('how-to');
});

router.get('/game/123', function (req, res, next) {
	res.render('game', {
		playerCards: {
			p1: Array(7).fill(0),
			p2: Array(7).fill(0),
			p3: Array(7).fill(0),
			user: Array(7).fill(0),
		},
	});
});

router.get('/login', function (req, res, next) {
	res.render('login');
});

router.get('/signup', function (req, res, next) {
	res.render('signup');
});

router.get('/terms&conditions');

router.get('/terms&conditions', function (req, res, next) {
	res.render('terms&conditions');
});

module.exports = router;
