const db = require('../db');

async function checkUserTurn(gameId, userId) {
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

	console.log(userIndex, fetchedGame.player_turn, userIndex === fetchedGame.player_turn);

	return {
		isUserTurn: userIndex === fetchedGame.player_turn,
		userIdList,
		fetchedGame,
	};
}

module.exports = {
	checkUserTurn,
};
