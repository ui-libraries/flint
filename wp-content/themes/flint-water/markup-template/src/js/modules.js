import $ from "jquery";
// import debounce from "./modules/debounce.js";

document.addEventListener("DOMContentLoaded", function() {
	isElementExist("body", testES6);
});

// Helper if element exist then call function
function isElementExist(_el, _cb) {
	var elem = document.querySelector(_el);

	if (document.body.contains(elem)) {
		try {
			_cb();
		} catch(e) {
			console.log(e);
		}
	}
}

function testES6() {
	let str = `window location is ${window.location}`;
	console.log(str);
	console.log($);
	// console.log(debounce);
	console.log(7 ** 2);
}
