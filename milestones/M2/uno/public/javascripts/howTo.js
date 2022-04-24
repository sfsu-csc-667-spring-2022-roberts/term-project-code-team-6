// modal
var modal = document.getElementById('htModal');
// button that opens modal (text on nav that says "how to play")
var btn = document.getElementById('htp-btn');
// span element that closes modal
var span = document.getElementById('close')[0];

if (btn) {
	btn.addEventListener('click', async () => {
		modal.style.display = "block";
	});
}

// // when user clicks button, open modal
// btn.onclick = function() {
//     modal.style.display = "block";
// }

// // when user click on X, close modal
// span.onclick = function() {
//     modal.style.display = "none";
// }

// // when user clicks outside of modal, close it
// window.onclick = function(event) {
//     if (event.target == modal) {
//         modal.style.display = "none";
//     }
// }