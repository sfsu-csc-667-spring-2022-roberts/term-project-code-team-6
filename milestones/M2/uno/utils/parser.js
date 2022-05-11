function parseCookie(cookie) {
	const cookieObj = {};
	if (cookie) {
		// console.log(cookie)
		const split = cookie.split('; ');
		try {
			split.forEach(s => {
				const pair = s.split('=');
				cookieObj[pair[0]] = pair[1];
			});
			if (cookieObj.unoSession) {
				console.log(cookieObj.unoSession);
				const sid = cookieObj.unoSession.split('.')[0].slice(4);
				console.log('sid is: ', sid);
				cookieObj.sid = sid;
			}
		} catch (err) {
			console.log(err);
		}
	}
	console.log('cookieobj is: ', cookieObj);
	return cookieObj;
}

module.exports = {
	parseCookie,
};
