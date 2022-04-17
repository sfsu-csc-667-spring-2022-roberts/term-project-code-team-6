const express = require('express');
const router = express.Router();
const authUser = require('../middleware/isAuth');
const { body, validationResult } = require('express-validator');
const db = require('../db');

// Create Game
router.post(
	'/create',
	authUser,
	body('title').not().isEmpty().trim().escape(),
	async (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				console.log(errors.array());
				throw new Error('Invalid form data: room title cannot be empty');
			}

			const title = req.body.title;
			const userId = req.session.userId;

			console.log('uid is: ', userId);

			let query = 'INSERT INTO games ("userCount") VALUES (1) RETURNING id';
			const { id } = await db.one(query, []);
			const gameId = id;
			console.log('Created game id is: ', gameId);

			query =
				'INSERT INTO game_users (game_id, user_id, "isReady", player_order) VALUES ($1, $2, true, 1);';
			await db.any(query, [gameId, userId]);

			let order = [];
			for (let i = 0; i < 108; i++) order.push(i + 1);

			for (let i = 0; i < 108; i++) {
				let rnd = Math.floor(Math.random() * 30);
				let temp = order[i];
				order[i] = order[rnd];
				order[rnd] = temp;
			}

			query = `INSERT INTO game_cards (game_id, card_id, "order") VALUES (${gameId}, ${1}, ${
				order[0]
			})`;
			for (let i = 1; i < 108; i++) {
				query += `, (${gameId}, ${i + 1}, ${order[i]})`;
			}
			await db.any(query, []);

			res.status(201).json({ title, userId, gameId });
		} catch (err) {
			next(err);
		}
	}
);

router.get('/:id', authUser, async (req, res, next) => {
	try {
		console.log(req.params);
		res.render('game', {
			playerCards: {
				p1: Array(7).fill(0),
				p2: Array(7).fill(0),
				p3: Array(7).fill(0),
				user: Array(7).fill(0),
			},
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
