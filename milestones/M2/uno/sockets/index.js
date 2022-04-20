const io = require('socket.io')();
const socketApi = {
	io: io,
};

io.on('connection', function (socket) {
	console.log('A user connected');

	socket.on('disconnect', () => {
		// io.emit('chat message', 'Someone disconnected!');
		console.log('user disconnected');
	});

	socket.on('play card', data => {
		socket.broadcast.emit('play card', data);
	});
});

module.exports = socketApi;
