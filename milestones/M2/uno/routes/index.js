var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express', teamNumber: 'D' });
});

/* GET how to play page. */
router.get('/how-to-play', function (req, res, next) {
	res.render('how-to');
});

/* GET how to play page. */
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
