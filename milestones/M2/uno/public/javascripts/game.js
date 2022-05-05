/* eslint-disable no-undef */
const CARD_OFFSET = 30;
const CARD_WIDTH = 80;
const CARD_HEIGHT = 126;

const pathArray = window.location.pathname.split('/');
const gameId =
	pathArray.length === 3 && pathArray[1] === 'game' ? pathArray[2] : null;

if (gameId) socket.emit('join room', { gameId: gameId });

const gameRoomDiv = document.getElementById('game-room');
const userCount = document.getElementById('user-count');
const discardedDiv = document.getElementById('discarded-cards');
const endTurnSpan = document.getElementById('end-turn');

const playerCards = document.getElementsByClassName('hand');
const p1 = document.getElementById('p1');
const p2 = document.getElementById('p2');
const p3 = document.getElementById('p3');
const userCards = document.getElementById('user-cards');

function updateBoard() {
	if (playerCards && playerCards.length > 0) {
		for (let hand of playerCards) {
			let right = 0;
			for (let card of hand.children) {
				card.style.right = right + 'px';
				right += CARD_OFFSET;
			}
		}

		// const p1 = playerCards.item(0);
		p1.style.transform = `translateX(${
			((CARD_WIDTH - CARD_OFFSET) * (p1.children.length - 1) + CARD_WIDTH) / -2
		}px)`;

		// const p2 = playerCards.item(1);
		const p2width =
			(CARD_WIDTH - CARD_OFFSET) * (p2.children.length - 1) + CARD_WIDTH;
		p2.style.transform = `translateY(${
			-CARD_HEIGHT - p2width / 2
		}px) rotate(90deg)`;

		// const p3 = playerCards.item(2);
		const p3width =
			(CARD_WIDTH - CARD_OFFSET) * (p3.children.length - 1) + CARD_WIDTH;
		const p3offsetY = -CARD_HEIGHT + p3width - p3width / 2;
		p3.style.transform = `translateY(${p3offsetY}px) translateX(${
			CARD_WIDTH * p3.children.length
		}px) rotate(-90deg)`;

		// const userCards = playerCards.item(3);
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

function removeEndTurn() {
	const endTurn = document.getElementById('end-turn');
	if (endTurn) endTurn.remove();
}

async function onEndTurn() {
	const result = await fetch(`/game/${gameId}/endTurn`, { method: 'POST' });
	await result.json();
	// console.log(body);

	removeEndTurn();

	removeYourTurn();

	// socket.emit('turn change', {
	// 	gameId: gameId,
	// 	nextPlayerId: body.nextPlayerId,
	// });
}

function createEndTurn() {
	const endTurnElm = document.createElement('span');
	endTurnElm.innerText = 'End Turn';
	endTurnElm.id = 'end-turn';
	endTurnElm.addEventListener('click', onEndTurn);
	gameRoomDiv.appendChild(endTurnElm);
}

function createYourWin(name) {
	const displayDiv = document.createElement('div');
	displayDiv.id = 'display-winner';

	const dummyDiv = document.createElement('div');

	const youWin = document.createElement('p');
	youWin.innerText = name + ' win';

	const playAgain = document.createElement('p');
	playAgain.innerText = 'Play Again';
	playAgain.id = 'play-again';
	playAgain.addEventListener('click', () => window.location.reload());

	dummyDiv.appendChild(youWin);
	dummyDiv.appendChild(playAgain);
	displayDiv.appendChild(dummyDiv);

	gameRoomDiv.appendChild(displayDiv);
}

async function onUpdateColor(body, color, popUpDiv) {
	// console.log(color, ' is clicked');
	const result = await fetch(
		`/game/${gameId}/wild/${body.wildFlag}/color/` + color,
		{
			method: 'POST',
		}
	);
	const msg = await result.json();
	// console.log(msg);
	if (!msg.yourTurn) removeYourTurn();

	updateRingColor(color);

	popUpDiv.remove();
	body.nextPlayerId = msg.nextPlayerId;
	socket.emit('play card', {
		id: body.cardId,
		gameId: gameId,
		color: body.color,
		selectedColor: color,
		value: body.value,
		rotate: body.rotate,
		nextPlayerId: body.nextPlayerId,
		playedBy: body.playedBy,
		userIdList: body.userIdList,
		winner: body.youWin ? body.username : null,
		neighbor: body.neighbor,
	});
}

async function onPlayCard(cardId) {
	const result = await fetch(`/game/${gameId}/play/` + cardId, {
		method: 'POST',
	});
	const body = await result.json();
	// console.log(body);

	if (body.status && body.status == 1001) {
		// console.log(body.message);
		return;
	}

	const card = document.getElementById(cardId);
	createNewDiscardedCard(card.className, cardId, body.rotate);

	if (body.neighbor.drawCount) {
		const userIndex = body.userIdList.findIndex(
			uid => uid.user_id === body.userId
		);
		// console.log('user index is: ', userIndex);

		const neighborIndex = body.userIdList.findIndex(
			uid => uid.user_id === body.neighbor.id
		);

		// console.log('neighborIndex index: ', neighborIndex);

		addBackCards(
			body.neighbor.drawCount,
			neighborIndex,
			userIndex,
			body.userIdList.length
		);
	}

	card.remove();

	if (!body.yourTurn) removeYourTurn();

	removeEndTurn();

	if (body.youWin) {
		// console.log('You win');
		removeYourTurn();
		createYourWin('You');
		stopTheGame();
	}

	if (!body.youWin && body.wildFlag) {
		const colorPopup = document.createElement('div');
		colorPopup.className = 'color-popup';

		const colorPicker = document.createElement('div');
		colorPicker.className = 'color-picker';

		const redPicker = document.createElement('div');
		redPicker.addEventListener('click', () =>
			onUpdateColor(body, 'red', colorPopup)
		);
		redPicker.className = 'redPicker';

		const bluePicker = document.createElement('div');
		bluePicker.addEventListener('click', () =>
			onUpdateColor(body, 'blue', colorPopup)
		);
		bluePicker.className = 'bluePicker';

		const greenPicker = document.createElement('div');
		greenPicker.addEventListener('click', () =>
			onUpdateColor(body, 'green', colorPopup)
		);
		greenPicker.className = 'greenPicker';

		const yellowPicker = document.createElement('div');
		yellowPicker.addEventListener('click', () =>
			onUpdateColor(body, 'yellow', colorPopup)
		);
		yellowPicker.className = 'yellowPicker';

		colorPicker.append(redPicker);
		colorPicker.append(bluePicker);
		colorPicker.append(greenPicker);
		colorPicker.append(yellowPicker);

		colorPopup.append(colorPicker);
		gameRoomDiv.append(colorPopup);
	}

	updateBoard();

	if (!body.wildFlag || body.youWin) {
		updateRingColor(body.color);
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
			neighbor: body.neighbor,
		});
	}
}

function addCardToHand(cards) {
	for (let card of cards) {
		const newCard = document.createElement('div');
		newCard.className = `card ${card.color}-${card.value}`;
		newCard.id = card.id;
		newCard.addEventListener('click', () => onPlayCard(card.id));
		userCards.appendChild(newCard);
	}
}

function addBackCards(count, affctedIndex, userIndex, playerCount) {
	for (let i = 0; i < count; i++) {
		const backcard = document.createElement('div');
		backcard.className = 'card backcard';

		if (playerCount == 2) {
			p1.appendChild(backcard);
		} else if (playerCount == 3) {
			(userIndex + 1) % playerCount === affctedIndex
				? p1.appendChild(backcard)
				: p2.appendChild(backcard);
		} else {
			if ((userIndex + 1) % playerCount === affctedIndex) {
				p3.appendChild(backcard);
			} else if ((userIndex + 2) % playerCount === affctedIndex) {
				p1.appendChild(backcard);
			} else {
				p2.appendChild(backcard);
			}
		}
	}
}

async function onDrawCard() {
	const result = await fetch(`/game/${gameId}/draw`, {
		method: 'POST',
	});
	const body = await result.json();
	// console.log(body);

	if (body.status && body.status == 1001) {
		// console.log(body.message);
		return;
	}

	// addCardToHand([body.card]);

	// createEndTurn();

	// updateBoard();

	// socket.emit('draw card', {
	// 	gameId: gameId,
	// 	nextPlayerId: body.nextPlayerId,
	// 	drewBy: body.drewBy,
	// 	userIdList: body.userIdList,
	// });
}

function stopTheGame() {
	if (userCards) {
		// console.log('remove user hand');
		const newUserCards = userCards.cloneNode(true);
		userCards.parentNode.replaceChild(newUserCards, userCards);
	}

	if (deck) {
		deck.removeEventListener('click', onDrawCard);
	}
}

function updateRingColor(color) {
	// console.log('color is: ', color);
	discardedDiv.className = `discarded-cards discarded-cards__${color}`;
}

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
	deck.addEventListener('click', onDrawCard);
}

if (userCards && gameId) {
	for (let card of userCards.children) {
		let cardId = card.id;
		card.addEventListener('click', () => onPlayCard(cardId));
	}
}

if (endTurnSpan) {
	// console.log(endTurnSpan);
	endTurnSpan.addEventListener('click', onEndTurn);
}

socket.on('join game', data => {
	// console.log(data);
	console.log('join the game');
	const newLobbyUser = document.createElement('div');
	const uid = document.createElement('p');
	const username = document.createElement('p');
	// const ready = document.createElement('p');
	uid.innerText = `uid: ${data.uid}`;
	username.innerText = `username: ${data.username}`;
	// ready.innerText = 'false';
	newLobbyUser.appendChild(uid);
	newLobbyUser.appendChild(username);
	// newLobbyUser.appendChild(ready);
	newLobbyUser.className = 'game-lobby_user';
	userCount.innerText = `${data.userCount} playing`;

	gameRoomDiv.appendChild(newLobbyUser);
});

// eslint-disable-next-line no-unused-vars
socket.on('start game', data => {
	setTimeout(() => window.location.reload(), Math.floor(Math.random() * 1000));
});

socket.on('draw card', async data => {
	// console.log(data);

	const result = await fetch('/userInfo');
	const body = await result.json();
	// console.log(body);

	// console.log(data.userIdList);

	if (data.drewBy === body.uid) {
		addCardToHand([data.card]);
		createEndTurn();
	} else {
		const userIndex = data.userIdList.findIndex(
			uid => uid.user_id === body.uid
		);
		// console.log('user index is: ', userIndex);

		const previousPlayerIndex = data.userIdList.findIndex(
			uid => uid.user_id === data.drewBy
		);

		// console.log('previous player index: ', previousPlayerIndex);

		addBackCards(1, previousPlayerIndex, userIndex, data.userIdList.length);
	}

	updateBoard();
});

socket.on('play card', async data => {
	// console.log(data);
	const className = `card ${data.color}-${data.value}`;
	createNewDiscardedCard(className, data.id, data.rotate);

	const result = await fetch('/userInfo');
	const body = await result.json();
	// console.log(body);

	data.selectedColor
		? updateRingColor(data.selectedColor)
		: updateRingColor(data.color);

	if (!data.winner && data.nextPlayerId === body.uid) {
		createYourTurn();
	}
	// console.log(data.userIdList);

	if (data.playedBy !== body.uid) {
		const userIndex = data.userIdList.findIndex(
			uid => uid.user_id === body.uid
		);
		// console.log('user index is: ', userIndex);

		const previousPlayerIndex = data.userIdList.findIndex(
			uid => uid.user_id === data.playedBy
		);

		// console.log('previous player index: ', previousPlayerIndex);

		// remove card from users's hand
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

		// add cards to user if draw2 and draw4 were played
		if (data.neighbor.drawCount) {
			if (data.neighbor.id === body.uid) {
				// console.log('update user hand');

				addCardToHand(data.neighbor.drawCards);
			} else {
				// console.log('update backcards');

				const userIndex = data.userIdList.findIndex(
					uid => uid.user_id === body.uid
				);
				// console.log('user index is: ', userIndex);

				const neighborIndex = data.userIdList.findIndex(
					uid => uid.user_id === data.neighbor.id
				);

				// console.log('neighbor index: ', neighborIndex);

				addBackCards(
					data.neighbor.drawCount,
					neighborIndex,
					userIndex,
					data.userIdList.length
				);
			}
		}
	}

	updateBoard();

	if (data.winner) {
		// console.log(data.winner + ' is the winner');
		createYourWin(data.winner);
		//remove card listeners from user
		stopTheGame();
	}
});

socket.on('turn change', async data => {
	// console.log(data);
	const result = await fetch('/userInfo');
	const body = await result.json();
	// console.log(body);
	if (data.nextPlayerId === body.uid) {
		createYourTurn();
	}
});

updateBoard();
