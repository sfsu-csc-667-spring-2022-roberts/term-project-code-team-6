const express = require('express');
const authUser = require('../middleware/isAuth');
const router = express.Router();

/* GET home page. */
router.get('/', authUser, function (req, res, next) {
	res.render('index', { title: 'UNO', teamNumber: 'D' });
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
