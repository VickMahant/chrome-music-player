(function() {
	console.log('in player js');
})();

// this will probably have to run everytime a song ends
// look into docs, a couple of useful functions: search,getSubTree,getChildren,create
// https://developer.chrome.com/extensions/bookmarks
var music = []; // this is kind of a waste of space, but it can be used as a filter
var volume;
var counter = 0;

function loadBookmarks(data, callback) {
	for (var i = 0; i < data['0'].children['0'].children['4'].children.length; i++) {
		// if object is not a sub folder, then we store it as music.
		if (data['0'].children['0'].children['4'].children[i].children == undefined) {
			music.push(data['0'].children['0'].children['4'].children[i]);
		}
	}
	callback(); // TODO: wrap this in it's own function because I call it like 50 times
}

var tag = document.createElement('script');

tag.src = 'scripts/lib/youtube-api.js';

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var playerDetails = {
	height: '0',
	width: '0',
	videoId: '',
	events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
	}
};

function onYouTubeIframeAPIReady() {
	chrome.bookmarks.getTree(function(data) {
		//console.log('data', data);
		loadBookmarks(data, function() {
			// sets video id to first song in bookmarks, gonna have to throw errors here if not youtube
			playerDetails.videoId = music[counter].url.substring((music[counter].url.indexOf('=') + 1));
			player = new YT.Player('player', playerDetails);
		});
	});
}

console.log(music.length);

function onPlayerReady(event) {
	event.target.playVideo();
	//event.target.pauseVideo(); // temp stop so it doesnt play ever reload
}

var done = false;
function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING && !done) {
		//setTimeout(stopVideo, 10000);
		done = true;
	}
}

// not sure if I should keep this in a function
function stopVideo() {
	player.stopVideo();
}

// getDuration and getCurrentTime()

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.message === 'play') {
		player.playVideo();
		sendResponse({message: 'play received'});
	} else if (request.message === 'pause') {
		player.pauseVideo();
		sendResponse({message: 'pause received'});
	} else if (request.message === 'next') {
		//player.nextVideo();
		counter++;
		chrome.bookmarks.getTree(function(data) {
			loadBookmarks(data, function() {
				if (counter >= music.length - 1) {
					counter = 0;
				}
				playerDetails.videoId = music[counter].url.substring((music[counter].url.indexOf('=') + 1));
				player = new YT.Player('player', playerDetails);
			});
		});
		sendResponse({message: 'next received'});
	} else if (request.message === 'prev') {
		//player.previousVideo();
		counter--;
		chrome.bookmarks.getTree(function(data) {
			loadBookmarks(data, function() {
				if (counter < 0) {
					counter = music.length - 1;
				}
				playerDetails.videoId = music[counter].url.substring((music[counter].url.indexOf('=') + 1));
				player = new YT.Player('player', playerDetails);
			});
		});
		sendResponse({message: 'prev received'});
	} else if (request.message === 'mute') {
		if (!player.isMuted()) {
			player.mute();
		} else {
			player.unMute();
		}
		sendResponse({message: 'mute received'});
	} else if (request.message === 'stop') {
		stopVideo();
	} else if (request.message === 'volume') {
		volume = request.volumeLevel;
		var changed = true;
		if (player.getVolume() != volume) {
			player.setVolume(volume);
			sendResponse({volumeLevel: player.getVolume()}); 
		} else {
			changed = false;
			sendResponse({volumeChanged: changed})
		}
	} else if (request.message === 'getVolume') {
		if (YT.PlayerState.PLAYING) {
			sendResponse({volumeLevel: player.getVolume()})
		} // keep an eye on this, not sure if it satifies all cases
	} else {
		throw console.log('error'); // temporary exception handler
	}
});
