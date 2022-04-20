const express = require('express');
const router = express.Router();
const authUser = require('../middleware/isAuth');
const { body, validationResult } = require('express-validator');
const db = require('../db');
let socketapi = require('../sockets');

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

		// check if the user is already in the game
		query = 'SELECT * FROM game_users WHERE game_id = $1 AND user_id = $2;';
		const fetchedPlayer = await db.oneOrNone(query, [fetchedGame.id, userId]);

		if (fetchedGame.active) {
			// <<NOTE>> Not allow other user to watch an active game for now
			if (!fetchedPlayer) {
				return res.redirect('/');
			}

			// await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1000 + 1000)));

			query =
				'SELECT id, color, value FROM game_cards\
				JOIN cards ON card_id = cards.id\
				WHERE game_id = $1 AND user_id = $2\
				ORDER BY "order"';
			const userCards = await db.any(query, [gameId, userId]);
			console.log(userCards);

			query =
				'SELECT user_id\
				FROM game_users\
				WHERE game_id = $1\
				ORDER BY player_order;';
			const userIdList = await db.any(query, [gameId]);
			console.log(userIdList);

			const userIndex = userIdList.findIndex(uid => uid.user_id === userId);
			console.log('user index is at: ', userIndex);

			// <<NOTE>> need update the query if we add observer
			query =
				'SELECT COUNT(*)\
				FROM game_cards\
				WHERE game_id = $1 AND user_id = $2;';
			playerCards = {};
			if (userIdList.length == 2) {
				const p1Index = (userIndex + 1) % userIdList.length;
				console.log('p1 index is at: ', p1Index);
				const p1Id = userIdList[p1Index].user_id;
				console.log('p1Id: ', p1Id);

				const p1CardCountObj = await db.one(query, [gameId, p1Id]);
				playerCards.p1 = new Array(+p1CardCountObj.count).fill(0);
			} else if (userIdList.length == 3) {
				console.log('to-do');
			} else {
				console.log('to-do');
			}

			playerCards.user = userCards;

			query =
				'SELECT id, color, value, rotate FROM game_cards\
				JOIN cards ON card_id = cards.id\
				WHERE game_id = $1 AND discarded = true\
				ORDER BY "order";';
			const discardedCards = await db.manyOrNone(query, [gameId]);

			res.render('game', {
				playerCards: playerCards,
				discardedCards: discardedCards,
				userCount: fetchedGame.userCount,
				active: fetchedGame.active,
				gameId: fetchedGame.id,
				isUserTurn: fetchedGame.player_turn === userIndex,
			});
		} else {
			if (fetchedPlayer) {
				console.log('fetchedPlayer: ', fetchedPlayer);
			}
			// add user if the user is not in the game and the game has less than 4 players
			else if (fetchedGame.userCount < 4) {
				console.log('current user count', fetchedGame.userCount);
				let updatedUserCount = ++fetchedGame.userCount;
				query =
					'INSERT INTO game_users(game_id, user_id, player_order) VALUES ($1, $2, $3);';
				await db.any(query, [fetchedGame.id, userId, updatedUserCount]);

				// update game user count
				query = 'UPDATE games SET "userCount" = $1 WHERE id = $2;';
				await db.any(query, [updatedUserCount, fetchedGame.id]);

				// get username
				query = 'SELECT username FROM users WHERE id = $1;';
				const { username } = await db.one(query, [userId]);

				socketapi.io.emit('join room', {
					uid: userId,
					username: username,
					userCount: updatedUserCount,
				});
			} else {
				console.log('observers');
			}

			query =
				'SELECT id AS uid, username, "isReady" FROM game_users \
					JOIN users ON user_id = users.id\
					WHERE game_id = $1';
			const players = await db.manyOrNone(query, fetchedGame.id);
			console.log('Players are: ', players);
			console.log('Updated user count', fetchedGame.userCount);

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

		// if (userCount < 2) {
		// 	return res
		// 		.status(400)
		// 		.json({
		// 			status: -1,
		// 			message: 'Must have at least 2 players to start the game',
		// 		});
		// }

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
		let end = INITIAL_CARD_COUNT;
		for (let i = 0; i < userIdList.length; i++) {
			query =
				'UPDATE game_cards\
			SET user_id = $1\
			WHERE "order" BETWEEN $2 AND $3 and game_id = $4;';
			console.log('Assgining cards to user: ', userIdList[i].user_id);
			await db.any(query, [userIdList[i].user_id, start, end, gameId]);
			start = end + 1;
			end = end + INITIAL_CARD_COUNT;
		}

		socketapi.io.emit('start game', { message: 'Game started' });

		// Redirect to /game/{id}
		// res.redirect('/game/' + gameId);
	} catch (err) {
		next(err);
	}
});

router.post('/:id/play/:cardId', authUser, async (req, res, next) => {
	try {
		const gameId = req.params.id;
		const cardId = req.params.cardId;
		const userId = req.session.userId;
		console.log('gameId is: ', gameId);
		console.log('cardId is: ', cardId);

		// check if player has that card

		let query =
			'SELECT user_id\
		FROM game_users\
		WHERE game_id = $1\
		ORDER BY player_order;';
		const userIdList = await db.any(query, [gameId]);
		console.log(userIdList);

		const userIndex = userIdList.findIndex(uid => uid.user_id === userId);

		query = 'SELECT *\
		FROM games\
		WHERE id = $1';
		const fetchedGame = await db.one(query, [gameId]);
		console.log('Game info: ', fetchedGame);
		console.log('Total discarded cards: ', fetchedGame.discardedCount);

		if (userIndex === fetchedGame.player_turn) {
			console.log("In user's turn");
		} else {
			return res.status(200).json({
				message: "Cannot not play cards in other user's turn",
				status: 1001,
			});
		}

		query =
			'UPDATE game_cards\
			SET user_id = null, discarded = true, "order" = $1, rotate = $2\
			WHERE game_id = $3 AND card_id = $4;';
		const newOrder = fetchedGame.discardedCount + 1;
		const rotate = Math.floor(Math.random() * 23) * 15; // rotate(0 deg to 359 deg)
		await db.any(query, [newOrder, rotate, gameId, cardId]);

		let updatedPlayerTurn =
			(fetchedGame.clockwise
				? fetchedGame.player_turn - 1
				: fetchedGame.player_turn + 1) % fetchedGame.userCount;
		updatedPlayerTurn =
			updatedPlayerTurn < 0 ? fetchedGame.userCount - 1 : updatedPlayerTurn;
		console.log('updated player turn: ', updatedPlayerTurn);
		query =
			'UPDATE games\
				SET "discardedCount" = $1, player_turn = $2\
				WHERE id = $3;';
		await db.any(query, [
			fetchedGame.discardedCount + 1,
			updatedPlayerTurn,
			gameId,
		]);

		query =
			'SELECT COUNT(*)\
		FROM game_cards\
		WHERE game_id = $1 AND user_id = $2';

		const { count } = await db.one(query, [gameId, userId]);
		// win condition met, brodcast this message
		console.log('current hand count: ', count);
		if (count == 0) {
			console.log(`player ${userId} wins`);
			return res.status(201).json({ message: `player ${userId} wins` });
		}

		query = 'SELECT *\
		FROM cards\
		WHERE id = $1';
		const fetchedCard = await db.one(query, [cardId]);
		fetchedCard.rotate = rotate;
		fetchedCard.nextPlayer = userIdList[updatedPlayerTurn];
		fetchedCard.playedBy = userId;
		console.log('next player is: ', fetchedCard.nextPlayer);

		socketapi.io.emit('play card', fetchedCard);

		res.status(201).json({
			message: `card ${cardId} is played`,
			cardId: cardId,
			rotate: rotate,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
