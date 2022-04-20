const io = require('socket.io')();
const socketapi = {
	io: io,
};

io.on('connection', function (socket) {
	console.log('A user connected');
	socket.on('disconnect', () => {
		io.emit('chat message', 'Someone disconnected!');
		console.log('user disconnected');
	});
});

module.exports = socketapi;
