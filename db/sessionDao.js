const db = require('../db');

const getSessionQuery =
	'SELECT sess\
    FROM public.session\
    WHERE sid = $1';

async function getSession(sid) {
	try {
		const { sess } = await db.one(getSessionQuery, [sid]);
		return sess;
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	getSession,
};
