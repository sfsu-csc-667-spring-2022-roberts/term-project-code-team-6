const db = require('../db');

const getUserIdQuery =
	'SELECT user_id\
	FROM game_users\
	WHERE game_id = $1\
	ORDER BY player_order;';

const getPlayerByIdQuery =
	'SELECT * FROM game_users WHERE game_id = $1 AND user_id = $2;';

const getAllPlayersQuery =
	'SELECT id AS uid, username, "isReady" FROM game_users \
    JOIN users ON user_id = users.id\
    WHERE game_id = $1';

async function getUserIdList(gameId) {
	try {
		const userIdList = await db.any(getUserIdQuery, [gameId]);
		return userIdList;
	} catch (err) {
		console.log(err);
	}
}

async function addNewPlayer(gameId, userId, isReady, playerOrder) {
	try {
		await db.any(
			'INSERT INTO game_users (game_id, user_id, "isReady", player_order)\
            VALUES ($1, $2, $3, $4);',
			[gameId, userId, isReady, playerOrder]
		);
	} catch (err) {
		console.log(err);
	}
}

async function getPlayerById(gameId, userId) {
	try {
		const fetchedPlayer = await db.oneOrNone(getPlayerByIdQuery, [
			gameId,
			userId,
		]);
		return fetchedPlayer;
	} catch (err) {
		console.log(err);
	}
}

async function getAllPlayers(gameId) {
	try {
		const fetchedPlayers = await db.manyOrNone(getAllPlayersQuery, [gameId]);
		return fetchedPlayers;
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	getUserIdList,
	addNewPlayer,
	getPlayerById,
	getAllPlayers,
};
