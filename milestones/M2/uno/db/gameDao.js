const db = require('../db');
const gameUserDao = require('./gameUserDao');

const getGameByIdQuery = 'SELECT *\
					FROM games\
					WHERE id = $1';

const updatePlayerTurnQuery =
	'UPDATE games\
	SET player_turn = $1\
	WHERE id = $2;';

const setDiscardedCountQuery =
	'UPDATE games\
	SET "discardedCount" = 0\
	WHERE id = $1;';

const updateUserCountQuery = 'UPDATE games SET "userCount" = $1 WHERE id = $2;';

async function checkUserTurn(gameId, userId) {
	try {
		const userIdList = await gameUserDao.getUserIdList(gameId);
		const userIndex = userIdList.findIndex(uid => uid.user_id === userId);
		const fetchedGame = await db.one(getGameByIdQuery, [gameId]);
		return {
			isUserTurn: userIndex === fetchedGame.player_turn,
			userIdList,
			fetchedGame,
		};
	} catch (err) {
		console.log(err);
	}
}

async function getGameById(gameId) {
	try {
		const fetchedGame = await db.one(getGameByIdQuery, [gameId]);
		return fetchedGame;
	} catch (err) {
		console.log(err);
	}
}

async function updatePlayerTurn(updatedPlayerTurn, gameId) {
	try {
		await db.any(updatePlayerTurnQuery, [updatedPlayerTurn, gameId]);
	} catch (err) {
		console.log(err);
	}
}

async function createGame() {
	try {
		const { id } = await db.one(
			'INSERT INTO games ("userCount") VALUES (1) \
			RETURNING id',
			[]
		);
		return id;
	} catch (err) {
		console.log(err);
	}
}

async function setDiscardedCount(gameId) {
	try {
		await db.any(setDiscardedCountQuery, [gameId]);
	} catch (err) {
		console.log(err);
	}
}

async function updateUserCount(gameId, userCount) {
	try {
		await db.any(updateUserCountQuery, [userCount, gameId]);
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	checkUserTurn,
	updatePlayerTurn,
	createGame,
	getGameById,
	setDiscardedCount,
	updateUserCount,
};
