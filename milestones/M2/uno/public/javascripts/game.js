const CARD_OFFSET = 30;
const CARD_WIDTH = 80;
const CARD_HEIGHT = 126;

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
	const p2offsetY = -CARD_HEIGHT + p2width - p2width / 2;
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

