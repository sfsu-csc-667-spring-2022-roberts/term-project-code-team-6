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

// Join or rejoin a game
router.get('/:id', authUser, async (req, res, next) => {
	try {
		const gameId = req.params.id;
		const userId = req.session.userId;
		let query = 'SELECT * FROM games WHERE id = $1';
		const fetchedGame = await db.oneOrNone(query, gameId);
		if (!fetchedGame) throw new Error('Game not found');
		console.log('fetchedGame: ', fetchedGame);
		if (fetchedGame.active) {
			query =
				'SELECT id, color, value FROM game_cards\
			JOIN cards ON card_id = cards.id\
			WHERE game_id = $1 AND user_id = $2\
			ORDER BY "order"';
			const userCards = await db.any(query, [gameId, userId]);
			console.log(userCards);

			res.render('game', {
				playerCards: {
					p1: Array(7).fill(0),
					p2: Array(7).fill(0),
					p3: Array(7).fill(0),
					user: userCards,
				},
				userCount: fetchedGame.userCount,
				active: fetchedGame.active,
				gameId: fetchedGame.id,
			});
		} else {
			// check if the user is already in the game
			query = 'SELECT * FROM game_users WHERE game_id = $1 AND user_id = $2;';
			const fetchedPlayer = await db.oneOrNone(query, [fetchedGame.id, userId]);
			if (fetchedPlayer) {
				console.log('fetchedPlayer: ', fetchedPlayer);
			}
			// add user if the user is not in the game and the game has less than 4 players
			else if (fetchedGame.userCount < 4) {
				console.log('current user count', fetchedGame.userCount);
				let updatedUserCount = fetchedGame.userCount + 1;
				query =
					'INSERT INTO game_users(game_id, user_id, player_order) VALUES ($1, $2, $3);';
				await db.any(query, [fetchedGame.id, userId, updatedUserCount]);

				// update game user count
				query = 'UPDATE games SET "userCount" = $1 WHERE id = $2;';
				await db.any(query, [updatedUserCount, fetchedGame.id]);
			} else {
				console.log('observers');
			}

			query =
				'SELECT id AS uid, username, "isReady" FROM game_users \
					JOIN users ON user_id = users.id\
					WHERE game_id = $1';
			const players = await db.manyOrNone(query, fetchedGame.id);
			console.log('Players are: ', players);

			res.render('game', {
				players: players,
				userCount: fetchedGame.userCount,
				active: fetchedGame.active,
				gameId: fetchedGame.id,
			});
		}
	} catch (err) {
		next(err);
	}
});

// Start game
router.post('/:id/start', authUser, async (req, res, next) => {
	try {
		const gameId = req.params.id;
		console.log(gameId);

		// Check if room has more than 1 player
		let query = 'SELECT "userCount"\
		FROM games\
		WHERE id = $1';
		const { userCount } = await db.one(query, [gameId]);
		console.log('Current player count is: ', userCount);

		if (userCount < 2) {
			throw new Error('Must have at least 2 players in the room');
		}

		// Set game to active
		query = 'UPDATE games SET active = true WHERE id = $1;';
		await db.any(query, [gameId]);

		// Assgin cards to players
		query =
			'SELECT card_id, "order"\
		FROM game_cards\
		WHERE game_id = $1 AND user_id IS null\
		ORDER BY "order"\
		LIMIT $2';
		const INITIAL_CARD_COUNT = 7;
		const limit = INITIAL_CARD_COUNT * userCount;
		const cardIdList = await db.any(query, [gameId, limit]);
		console.log(cardIdList);

		query =
			'SELECT user_id\
		FROM game_users\
		WHERE game_id = $1\
		ORDER BY player_order;';
		const userIdList = await db.any(query, [gameId]);
		console.log(userIdList);

		let start = 1;
		let end = 7;
		for (let i = 0; i < userIdList.length; i++) {
			query =
				'UPDATE game_cards\
			SET user_id = $1\
			WHERE "order" BETWEEN $2 AND $3 and game_id = $4;';
			console.log('Assgining cards to user: ', userIdList[i].user_id);
			await db.any(query, [userIdList[i].user_id, start, end, gameId])
			start = end + 1;
			end = end + INITIAL_CARD_COUNT;
		}

		// Redirect to /game/{id}
		res.redirect('/game/' + gameId);
	} catch (err) {
		next(err);
	}
});

module.exports = router;
