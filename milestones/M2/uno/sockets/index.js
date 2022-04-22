const io = require('socket.io')();
const socketApi = {
	io: io,
};

io.on('connection', function (socket) {
	console.log('A user connected');

	socket.join('lobby');

	socket.on('disconnect', () => {
		// io.emit('chat message', 'Someone disconnected!');
		console.log('user disconnected');
	});

	socket.on('draw card', data => {
		if (data.gameId)
			socket.broadcast.to('room' + data.gameId).emit('draw card', data);
	});

	socket.on('play card', data => {
		if (data.gameId)
			socket.broadcast.to('room' + data.gameId).emit('play card', data);
	});

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
