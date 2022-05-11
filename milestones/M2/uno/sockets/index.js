const io = require('socket.io')();
const { parseCookie } = require('../utils/parser');
const { getSession } = require('../db/sessionDao');
const { addSocket, removeSocket } = require('../utils/socketMap');
const socketApi = {
	io: io,
};

io.on('connection', async function (socket) {
	console.log('A user connected');
	const cookie = socket.handshake.headers.cookie;
	const parsedCookie = parseCookie(cookie);
	let userId;
	if (parsedCookie.sid) {
		console.log(parsedCookie.sid);
		const session = await getSession(parsedCookie.sid);
		console.log('session is: ', session);
		if (session.userId) {
			userId = session.userId;
			addSocket(userId, socket);
		}
	}

	socket.join('lobby');

	socket.on('disconnect', () => {
		console.log('user disconnected');
		if (userId) {
			removeSocket(userId);
		}
	});

	// socket.on('draw card', data => {
	// 	if (data.gameId)
	// 		socket.broadcast.to('room' + data.gameId).emit('draw card', data);
	// });

	socket.on('play card', data => {
		if (data.gameId)
			socket.broadcast.to('room' + data.gameId).emit('play card', data);
	});

	// socket.on('turn change', data => {
	// 	if (data.gameId)
	// 		socket.broadcast.to('room' + data.gameId).emit('turn change', data);
	// });

	socket.on('chat message', data => {
		console.log('socket chat message: ', data);
		socket.broadcast.to(data.destination).emit('chat message', data);
	});

	socket.on('join room', data => {
		if (data.gameId) {
			console.log('join room ', data.gameId);
			socket.join('room' + data.gameId);
		}
	});
});

module.exports = socketApi;
