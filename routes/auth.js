const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { removeSocket } = require('../utils/socketMap');

const SALT_ROUNDS = 12;

router.post(
	'/signup',
	body('email').isEmail(),
	body('username').not().isEmpty().trim().escape(),
	body('password').isLength({ min: 5 }),
	async (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				console.log(errors.array());
				throw new Error(
					'Invalid form data: Check if email is valid and the password of length greater than 4'
				);
				// return res.redirect('/signup');
			}

			console.log(req.body);
			const email = req.body.email;
			const username = req.body.username;
			const password = req.body.password;

			let query = 'SELECT id FROM users WHERE email = $1';
			const fetchedUser = await db.oneOrNone(query, [email]);
			if (fetchedUser) {
				throw new Error('Email already exsists');
			}

			const hashPw = await bcrypt.hash(password, SALT_ROUNDS);
			query = `INSERT INTO users (email, username, password) VALUES ($1, $2, $3)`;
			await db.any(query, [email, username, hashPw]);

			// Might add a modal or flash message
			res.redirect('/login');
		} catch (err) {
			next(err);
		}
	}
);

router.post(
	'/login',
	body('email').isEmail(),
	body('password').isLength({ min: 5 }),
	async (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				console.log(errors.array());
				throw new Error(
					'Invalid form data: Check if email is valid and the password of length greater than 4'
				);
			}

			const email = req.body.email;
			const password = req.body.password;

			console.log(req.body);
			let query = 'SELECT * FROM users WHERE email = $1';
			const user = await db.oneOrNone(query, [email]);
			console.log(user);
			if (!user) {
				const error = new Error('Incorrect email or password.');
				error.statusCode = 403;
				throw error;
			}
			console.log('user password is: ', user.password);
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				const error = new Error('Incorrect email or password.');
				error.statusCode = 403;
				throw error;
			}

			req.session.email = user.email;
			req.session.userId = user.id;

			res.locals.isAuth = true;

			console.log('Session email: ', req.session.email);
			console.log('Session userId: ', req.session.userId);
			console.log('local isAuth', res.locals.isAuth);

			res.redirect('/');
		} catch (err) {
			next(err);
		}
	}
);

router.post('/logout', (req, res, next) => {
	console.log('logging out');
	const userId = req.session.userId;
	req.session.destroy(err => {
		if (err) {
			console.log('Session could not be destroyed.');
			next(err);
		} else {
			console.log('Session was destroyed.');
			res.clearCookie('unoSession');
			removeSocket(userId);
			res.json({ status: 'OK', message: 'user is logged out' });
		}
	});
});

module.exports = router;
