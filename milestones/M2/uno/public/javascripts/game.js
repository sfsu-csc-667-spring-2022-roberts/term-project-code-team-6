/* eslint-disable no-undef */
const CARD_OFFSET = 30;
const CARD_WIDTH = 80;
const CARD_HEIGHT = 126;

function updateBoard() {
	const playerCards = document.getElementsByClassName('hand');
	if (playerCards && playerCards.length > 0) {
		for (let hand of playerCards) {
			let right = 0;
			for (let card of hand.children) {
				card.style.right = right + 'px';
				right += CARD_OFFSET;
			}
		}

		const p1 = playerCards.item(0);
		p1.style.transform = `translateX(${
			((CARD_WIDTH - CARD_OFFSET) * (p1.children.length - 1) + CARD_WIDTH) / -2
		}px)`;

		const p2 = playerCards.item(1);
		const p2width =
			(CARD_WIDTH - CARD_OFFSET) * (p2.children.length - 1) + CARD_WIDTH;
		p2.style.transform = `translateY(${
			-CARD_HEIGHT - p2width / 2
		}px) rotate(90deg)`;

		const p3 = playerCards.item(2);
		const p3width =
			(CARD_WIDTH - CARD_OFFSET) * (p3.children.length - 1) + CARD_WIDTH;
		const p3offsetY = -CARD_HEIGHT + p3width - p3width / 2;
		p3.style.transform = `translateY(${p3offsetY}px) translateX(${
			CARD_WIDTH * p3.children.length
		}px) rotate(-90deg)`;

		const userCards = playerCards.item(3);
		userCards.style.transform = `translateX(${
			((CARD_WIDTH - CARD_OFFSET) * (userCards.children.length - 1) +
				CARD_WIDTH) /
			-2
		}px)`;
	}
}

// remove your turn notice
function removeYourTurn() {
	const yourTurn = document.getElementById('your-turn');
	if (yourTurn) yourTurn.remove();
}

function createYourTurn() {
	const yourTurnElm = document.createElement('h1');
	yourTurnElm.innerText = 'Your turn';
	yourTurnElm.id = 'your-turn';
	gameRoomDiv.appendChild(yourTurnElm);
}

async function onCardPlay(cardId) {
	const result = await fetch(`/game/${gameId}/play/` + cardId, {
		method: 'POST',
	});
	const body = await result.json();
	console.log(body);

	if (body.status && body.status == 1001) {
		console.log(body.message);
		return;
	}

	const card = document.getElementById(cardId);
	createNewDiscardedCard(card.className, cardId, body.rotate);

	card.remove();

	if (!body.yourTurn) removeYourTurn();

	updateBoard();

	if (body.youWin) {
		// To do - add ui
		console.log('You win');
	}

	if (!body.youWin && body.isColorRequired) {
		console.log('Get user color input');
		const result = await fetch(`/game/${gameId}/wild/` + 'red', {
			method: 'POST',
		});
		const msg = await result.json();
		console.log(msg);
		removeYourTurn();
	}

	socket.emit('play card', {
		id: body.cardId,
		gameId: gameId,
		color: body.color,
		value: body.value,
		rotate: body.rotate,
		nextPlayerId: body.nextPlayerId,
		playedBy: body.playedBy,
		userIdList: body.userIdList,
		winner: body.youWin ? body.username : null,
	});
}

const userCards = document.getElementById('user-cards');
const pathArray = window.location.pathname.split('/');
const gameId =
	pathArray.length === 3 && pathArray[1] === 'game' ? pathArray[2] : null;

if (gameId) socket.emit('join room', { gameId: gameId });

const startBtn = document.getElementById('start-game');
if (startBtn && gameId) {
	startBtn.addEventListener('click', async () => {
		await fetch(`/game/${gameId}/start`, { method: 'POST' });
		window.location.reload();
	});
}

const discardedContainer = document.getElementById('discarded-cards_container');
function createNewDiscardedCard(className, cardId, rotate) {
	const newDiscarded = document.createElement('div');
	newDiscarded.setAttribute('class', className);
	newDiscarded.setAttribute('id', cardId);
	newDiscarded.style.transform = `rotate(${rotate}deg)`;
	discardedContainer.appendChild(newDiscarded);
}

const deck = document.getElementById('deck');
if (userCards && deck && gameId) {
	deck.addEventListener('click', async () => {
		const result = await fetch(`/game/${gameId}/draw`, {
			method: 'POST',
		});
		const body = await result.json();
		console.log(body);

		if (body.status && body.status == 1001) {
			console.log(body.message);
			return;
		}

		const newCard = document.createElement('div');
		newCard.className = `card ${body.card.color}-${body.card.value}`;
		newCard.id = body.card.id;
		newCard.addEventListener('click', () => onCardPlay(body.card.id));
		userCards.appendChild(newCard);

		removeYourTurn();

		updateBoard();

		socket.emit('draw card', {
			gameId: gameId,
			nextPlayerId: body.nextPlayerId,
			drewBy: body.playedBy,
			userIdList: body.userIdList,
		});
	});
}

if (userCards && gameId) {
	for (let card of userCards.children) {
		let cardId = card.id;
		card.addEventListener('click', () => onCardPlay(cardId));
	}
}

const gameRoomDiv = document.getElementById('game-room');
const userCount = document.getElementById('user-count');

socket.on('join game', data => {
	console.log(data);
	if (data.gameId && data.gameId == gameId) {
		const newLobbyUser = document.createElement('div');
		const uid = document.createElement('p');
		const username = document.createElement('p');
		const ready = document.createElement('p');
		uid.innerText = `uid: ${data.uid}`;
		username.innerText = `username: ${data.username}`;
		ready.innerText = 'false';
		newLobbyUser.appendChild(uid);
		newLobbyUser.appendChild(username);
		newLobbyUser.appendChild(ready);
		newLobbyUser.className = 'game-lobby_user';
		userCount.innerText = `${data.userCount} playing`;

		gameRoomDiv.appendChild(newLobbyUser);
	}
});

// eslint-disable-next-line no-unused-vars
socket.on('start game', data => {
	// Don't know why if reload is trigged at the same time
	// users all get the same cards
	setTimeout(() => window.location.reload(), Math.floor(Math.random() * 1000));
});

socket.on('draw card', async data => {
	console.log(data);

	const result = await fetch('/userInfo');
	const body = await result.json();
	console.log(body);

	if (data.nextPlayerId === body.uid) {
		createYourTurn();
	}

	console.log(data.userIdList);

	const userIndex = data.userIdList.findIndex(uid => uid.user_id === body.uid);
	console.log('user index is: ', userIndex);

	const previousPlayerIndex = data.userIdList.findIndex(
		uid => uid.user_id === data.playedBy
	);

	console.log('previous player index: ', previousPlayerIndex);

	const p1 = document.getElementById('p1');
	const p2 = document.getElementById('p2');
	const p3 = document.getElementById('p3');

	const backcard = document.createElement('div');
	backcard.className = 'card backcard';

	if (data.userIdList.length == 2) {
		p1.appendChild(backcard);
	} else if (data.userIdList.length == 3) {
		(userIndex + 1) % data.userIdList.length === previousPlayerIndex
			? p1.appendChild(backcard)
			: p2.appendChild(backcard);
	} else {
		if ((userIndex + 1) % data.userIdList.length === previousPlayerIndex) {
			p3.appendChild(backcard);
		} else if (
			(userIndex + 2) % data.userIdList.length ===
			previousPlayerIndex
		) {
			p1.appendChild(backcard);
		} else {
			p2.appendChild(backcard);
		}
	}

	updateBoard();
});

socket.on('play card', async data => {
	console.log(data);
	const className = `card ${data.color}-${data.value}`;
	createNewDiscardedCard(className, data.id, data.rotate);

	const result = await fetch('/userInfo');
	const body = await result.json();
	console.log(body);

	if (!data.winner && data.nextPlayerId === body.uid) {
		createYourTurn();
	}
	console.log(data.userIdList);

	if (data.playedBy !== body.uid) {
		const userIndex = data.userIdList.findIndex(
			uid => uid.user_id === body.uid
		);
		console.log('user index is: ', userIndex);

		const previousPlayerIndex = data.userIdList.findIndex(
			uid => uid.user_id === data.playedBy
		);

		console.log('previous player index: ', previousPlayerIndex);

		const p1 = document.getElementById('p1');
		const p2 = document.getElementById('p2');
		const p3 = document.getElementById('p3');

		if (data.userIdList.length == 2) {
			p1.removeChild(p1.children[p1.children.length - 1]);
		} else if (data.userIdList.length == 3) {
			(userIndex + 1) % data.userIdList.length === previousPlayerIndex
				? p1.removeChild(p1.children[p1.children.length - 1])
				: p2.removeChild(p2.children[p2.children.length - 1]);
		} else {
			if ((userIndex + 1) % data.userIdList.length === previousPlayerIndex) {
				p3.removeChild(p3.children[p3.children.length - 1]);
			} else if (
				(userIndex + 2) % data.userIdList.length ===
				previousPlayerIndex
			) {
				p1.removeChild(p1.children[p1.children.length - 1]);
			} else {
				p2.removeChild(p2.children[p2.children.length - 1]);
			}
		}
	}

	updateBoard();

	if (data.winner) {
		console.log(data.winner + ' is the winner');

		// to-do remove card listeners from user
	}
});

// socket.on win => remove card listener so user can not play cards

updateBoard();
