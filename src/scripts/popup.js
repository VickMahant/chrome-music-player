/**
 * @author Brandon Manke
 * @file player.js
 */
(function() {
	var volume;

	chrome.runtime.sendMessage({message: 'getVolume'}, function (response) {
		volume = document.getElementById('volume');
		volume.value = response.volumeLevel;
	});

	document.getElementById('play').addEventListener('click', function() {
		chrome.runtime.sendMessage({message: 'play'}, function(response) {
			console.log(response.message);
		});
	});

	document.getElementById('pause').addEventListener('click', function() {
		chrome.runtime.sendMessage({message: 'pause'}, function(response) {
			console.log(response.message);
		});
	});

	document.getElementById('stop').addEventListener('click', function() {
		chrome.runtime.sendMessage({message: 'stop'}, function(response) {
			console.log(response.message);
		});
	});

	document.getElementById('mute').addEventListener('click', function() {
		chrome.runtime.sendMessage({message: 'mute'}, function(response) {
			console.log(response.message);
		});
	});

	document.getElementById('next').addEventListener('click', function() {
		chrome.runtime.sendMessage({message: 'next'}, function(response) {
			console.log(response.message);
		});
	});

	document.getElementById('prev').addEventListener('click', function() {
		chrome.runtime.sendMessage({message: 'prev'}, function(response) {
			console.log(response.message);
		});
	});

	// 'input' updates as value changing, versus 'change' which updates after user lets go of mouse
	document.getElementById('volume').addEventListener('input', function() {
		volume = document.getElementById('volume');
		chrome.runtime.sendMessage({message: 'volume', volumeLevel: volume.value}, function(response) {
			// I honestly have no idea why this is working right now, 
			// because it only send the response.volumeChanged when this is false.
			// If I send it when it is true, the input range becomes really buggy and jumps around.
		 	if (response.volumeChanged) {
		 		volume.value = response.volumeLevel;
		 	}
		});
		console.log('volume value: ', volume.value);
	});
})();