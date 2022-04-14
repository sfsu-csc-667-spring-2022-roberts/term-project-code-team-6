const logout = document.getElementById('nav-logout-btn');
if (logout) {
	logout.addEventListener('click', async () => {
		const result = await fetch('/auth/logout', {
			method: 'POST',
		});
		const body = await result.json();
		console.log(body);
		location.replace('/');
	});
}
