console.log(gameId);

const messages = document.getElementById('chat-msg');
console.log(messages);

// Emittine Events
const form = document.getElementById('chat-box');
const input = document.getElementById('chat-input');

console.log(form);
console.log(input);

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
		socket.emit('chat message', {
			destination: 'room' + gameId,
			username: body.username,
			message: input.value,
		});

		// const chatDiv = document.createElement('div');
		// const chatUsername = document.createElement('span');
		// const chatMsg = document.createElement('p');
		// chatUsername.innerText = body.username + ': ';
		// chatMsg.innerText = input.value;
		// chatDiv.appendChild(chatUsername);
		// chatDiv.className = 'chat-container';
		// chatDiv.appendChild(chatMsg);
		// messages.appendChild(chatDiv);

		createChatDiv(body.username, input.value);

		input.value = '';
	}
});

socket.on('chat message', data => {
	console.log('on chat message');
	createChatDiv(data.username, data.message);

	// const chatDiv = document.createElement('div');
	// const chatUsername = document.createElement('span');
	// const chatMsg = document.createElement('p');

	// chatUsername.innerText = data.username + ': ';
	// chatMsg.innerText = data.message;
	// chatDiv.appendChild(chatUsername);
	// chatDiv.className = 'chat-container';
	// chatDiv.appendChild(chatMsg);
	// messages.appendChild(chatDiv);
});
