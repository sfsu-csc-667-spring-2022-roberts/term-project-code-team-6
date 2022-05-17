const createGameBtn = document.getElementById('create-game');

if (createGameBtn) {
	createGameBtn.addEventListener('click', async () => {
		const result = await fetch('/game/create', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ title: 'Default Game' }),
		});
		const body = await result.json();
		console.log(body);
		location.assign('/game/' + body.gameId);
	});
}
