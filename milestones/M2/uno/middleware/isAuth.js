function authUser(req, res, next) {
	if (req.session.email) {
		console.log(`user with email: ${req.session.email} is logged in`);
		next();
	} else {
		console.log('not login');
		// add modal or flash messages to notify users
		res.redirect('/login');
	}
}

module.exports = authUser;
