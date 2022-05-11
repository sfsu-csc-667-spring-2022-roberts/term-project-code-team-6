const db = require('../db');

async function getSession(sid) {
	let query =
		'SELECT sess\
	            FROM public.session\
                WHERE sid = $1';
	const {sess} = await db.one(query, [sid]);
	return sess;
}

module.exports = {
	getSession,
};
