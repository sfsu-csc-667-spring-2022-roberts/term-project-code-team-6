const messages = document.getElementById('chat-msg');
const form = document.getElementById('chat-box');
const input = document.getElementById('chat-input');

function createChatDiv(username, message) {
	const chatDiv = document.createElement('div');
	const chatUsername = document.createElement('span');
	const chatMsg = document.createElement('p');
	chatUsername.innerText = username + ': ';
	chatMsg.innerText = message;
	chatDiv.appendChild(chatUsername);
	chatDiv.className = 'chat-container';
	chatDiv.appendChild(chatMsg);
	messages.appendChild(chatDiv);
}

form.addEventListener('submit', async function (e) {
	e.preventDefault();
	console.log(input.value);
	if (input.value) {
		const result = await fetch('/userInfo');
		const body = await result.json();
		console.log(body);
		const destination = gameId ? 'room' + gameId : 'lobby';
		socket.emit('chat message', {
			destination: destination,
			username: body.username,
			message: input.value,
		});

		createChatDiv(body.username, input.value);

		input.value = '';
	}
});

socket.on('chat message', data => {
	console.log('on chat message');
	console.log(data);
	if (data.destination !== 'lobby' || !gameId)
		createChatDiv(data.username, data.message);
});
