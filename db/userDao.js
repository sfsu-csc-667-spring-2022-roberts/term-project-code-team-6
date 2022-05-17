const db = require('../db');

const getUserInfoQuery = 'SELECT username, email FROM users WHERE id = $1;';

async function getUserInfo(userId) {
	try {
		const userInfo = await db.one(getUserInfoQuery, [userId]);
		return userInfo;
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	getUserInfo,
};
