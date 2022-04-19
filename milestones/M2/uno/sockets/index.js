const socketio = require('socket.io');
const socket = socketio();


socket.on("connection", (socket) => {
    
});

module.exports = socket;