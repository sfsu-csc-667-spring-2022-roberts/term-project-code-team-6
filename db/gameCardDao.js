const db = require('../db');
const gameDao = require('./gameDao');

const getDrawableCardsQuery =
	'SELECT id, color, value\
	FROM public.game_cards\
	JOIN cards ON card_id = cards.id\
	WHERE game_id = $1 AND user_id IS null AND discarded = false\
	ORDER BY "order"\
	LIMIT $2;';

const resetDiscardedCardsQuery =
	'UPDATE game_cards\
	SET discarded = false\
	WHERE game_id = $1;';

const getUserCardsQuery =
	'SELECT id, color, value FROM game_cards\
    JOIN cards ON card_id = cards.id\
    WHERE game_id = $1 AND user_id = $2\
    ORDER BY "order"';

const getUserCardCountQuery =
	'SELECT COUNT(*)\
    FROM game_cards\
    WHERE game_id = $1 AND user_id = $2;';

const getDiscardedCardQuery =
	'SELECT id, color, value, rotate FROM game_cards\
    JOIN cards ON card_id = cards.id\
    WHERE game_id = $1 AND discarded = true\
    ORDER BY "order";';

const assignCardToUserQuery =
	'UPDATE game_cards\
    SET user_id = $1\
    WHERE game_id = $2 AND card_id = $3;';

async function getUserCards(gameId, userId) {
	try {
		const userCards = await db.any(getUserCardsQuery, [gameId, userId]);
		return userCards;
	} catch (err) {
		console.log(err);
	}
}

async function getUserCardCount(gameId, userId) {
	try {
		const { count } = await db.one(getUserCardCountQuery, [gameId, userId]);
		return parseInt(count);
	} catch (err) {
		console.log(err);
	}
}

async function getDiscardedCards(gameId) {
	try {
		const discardedCards = await db.manyOrNone(getDiscardedCardQuery, [gameId]);
		return discardedCards;
	} catch (err) {
		console.log(err);
	}
}

async function drawCards(gameId, userId, count) {
	let cardToAssgin = await db.manyOrNone(getDrawableCardsQuery, [
		gameId,
		count,
	]);
	console.log('cardToAssgin', cardToAssgin);

	if (cardToAssgin.length < count) {
		console.log(
			`No enough cards in the deck: Need: ${count}, Actual: ${cardToAssgin.length} , shuffle the discard pile`
		);
		await db.any(resetDiscardedCardsQuery, [gameId]);

		// set discard to 0
		// query =
		// 	'UPDATE games\
		//     SET "discardedCount" = 0\
		//     WHERE id = $1;';
		// await db.any(query, [gameId]);
		await gameDao.setDiscardedCount(gameId);

		const retObj = await drawCards(gameId, userId, count);
		retObj.reshuffle = true;
		console.log(retObj);
		return retObj;
	}

	for (let i = 0; i < count; i++) {
		console.log(`Assgining card ${cardToAssgin[i].id} to user: ${userId}`);
		await db.any(assignCardToUserQuery, [userId, gameId, cardToAssgin[i].id]);
	}
	return {
		cardToAssgin,
		reshuffle: false,
	};
}

async function shuffleCards(gameId) {
	try {
		let order = [];
		for (let i = 0; i < 108; i++) order.push(i + 1);

		for (let i = 0; i < 108; i++) {
			let rnd = Math.floor(Math.random() * 30);
			let temp = order[i];
			order[i] = order[rnd];
			order[rnd] = temp;
		}

		let query = `INSERT INTO game_cards (game_id, card_id, "order") VALUES (${gameId}, ${1}, ${
			order[0]
		})`;
		for (let i = 1; i < 108; i++) {
			query += `, (${gameId}, ${i + 1}, ${order[i]})`;
		}
		await db.any(query, []);
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	getUserCards,
	getUserCardCount,
	getDiscardedCards,
	shuffleCards,
	drawCards,
};
