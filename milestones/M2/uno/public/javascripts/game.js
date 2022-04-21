const CARD_OFFSET = 30;
const CARD_WIDTH = 80;
const CARD_HEIGHT = 126;

function updateBoard() {
	const playerCards = document.getElementsByClassName('hand');
	if (playerCards && playerCards.length > 0) {
		for (hand of playerCards) {
			let right = 0;
			for (card of hand.children) {
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

const userCards = document.getElementById('user-cards');
const pathArray = window.location.pathname.split('/');
const game = document.getElementsByClassName('game');
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

if (userCards && gameId) {
	for (card of userCards.children) {
		let cardId = card.id;
		card.addEventListener('click', async () => {
			const result = await fetch(`/game/${gameId}/play/` + cardId, {
				method: 'POST',
			});
			const body = await result.json();
			console.log(body);

			if (body.status && body.status == 1001) return;

			const card = document.getElementById(cardId);
			createNewDiscardedCard(card.className, cardId, body.rotate);

			card.remove();

			// remove your turn notice
			const yourTurn = document.getElementById('your-turn');
			if (yourTurn) yourTurn.remove();
			updateBoard();

			if (body.status && body.status == 1002) {
				// To do - add ui
				console.log('You win');
				return;
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
			});
		});
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

socket.on('start game', data => {
	// Don't know why if reload is trigged at the same time
	// users all get the same cards
	setTimeout(() => window.location.reload(), Math.floor(Math.random() * 100));
});

socket.on('play card', async data => {
	console.log(data);
	const className = `card ${data.color}-${data.value}`;
	createNewDiscardedCard(className, data.id, data.rotate);

	const result = await fetch('/userInfo');
	const body = await result.json();
	console.log(body);

	if (data.nextPlayerId === body.uid) {
		const yourTurnElm = document.createElement('h1');
		yourTurnElm.innerText = 'Your turn';
		yourTurnElm.id = 'your-turn';
		gameRoomDiv.appendChild(yourTurnElm);
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
		const p3 = document.getElementById('p2');

		if (data.userIdList.length == 2) {
			p1.removeChild(p1.children[p1.children.length - 1]);
		}
		if (data.userIdList.length == 3) {
			(userIndex + 1) % data.userIdList.length === previousPlayerIndex
				? p1.removeChild(p1.children[p1.children.length - 1])
				: p2.removeChild(p2.children[p2.children.length - 1]);
		}
	}

	updateBoard();
});

// socket.on win => remove card listener so user can not play cards

updateBoard();
