const pathArray = window.location.pathname.split('/');
const gameId =
	pathArray.length === 3 && pathArray[1] === 'game' ? pathArray[2] : null;

var messages = document.getElementById('chat-msg');

// Emittine Events
var form = document.getElementById('chat-box');
var input = document.getElementById('chat-inpu');

form.addEventListener('submit', function (e) {
	e.preventDefault();
	if (input.value) {
		socket.emit('chat message', input.value);
	}
});
