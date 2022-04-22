const db = require('../db');

async function drawCards(gameId, userId, count) {
	let query =
		'SELECT card_id\
			FROM public.game_cards\
			WHERE game_id = $1 AND user_id IS null AND discarded = false\
			ORDER BY "order"\
			LIMIT $2;';
	const cardToAssgin = await db.manyOrNone(query, [gameId, count]);
	console.log(cardToAssgin);

	if (!cardToAssgin) {
		console.log('No cards in the deck');
		return { cardToAssgin };
	}

	for (let i = 0; i < count; i++) {
		query =
			'UPDATE game_cards\
                SET user_id = $1\
                WHERE game_id = $2 AND card_id = $3;';
		console.log(`Assgining card ${cardToAssgin[i].card_id} to user: ${userId}`);
		await db.any(query, [userId, gameId, cardToAssgin[i].card_id]);
	}
	return {
		cardToAssgin,
	};
}

module.exports = {
	drawCards,
};
