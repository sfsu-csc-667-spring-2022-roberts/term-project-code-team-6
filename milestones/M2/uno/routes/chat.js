const express = require('express');
const router = express.Router();
const authUser = require('../middleware/isAuth');
const socketApi = require('../sockets');

router.post('/', authUser, async (req, res, next) => {
	try {
		socketApi.io.to(req.body.destination).emit('chat message', {
			destination: req.body.destination,
			username: req.body.username,
			message: req.body.message,
		});

		res.status(200).json({
			message: 'message sent',
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
