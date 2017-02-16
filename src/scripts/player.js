/**
 * @author Brandon Manke
 * @file player.js
 */

// Possibly a more effecient way of skipping and going back on tracks:
// look into loadVideoByUrl() function youtube iframe api
// also loadPlayist() - takes array of ids this could make it much much easier
// thumbnail for nice looking frontend:
// http://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api?rq=1

// Maybe try to move some of these out of global
var music = []; // this is kind of a waste of space, but it can be used as a filter
var volume;
var counter = 0;

function loadBookmarks(data, callback) {
	music = [];
	for (var i = 0; i < data['0'].children['0'].children['4'].children.length; i++) {
		// if object is not a sub folder, then we store it as music.
		// maybe include isYoutubeUrl filter here?
		if (data['0'].children['0'].children['4'].children[i].children == undefined) {
			music.push(data['0'].children['0'].children['4'].children[i]);
		}
	}
	//console.log('music length:', music.length);
	callback(); // this might be a little redundant
}

function checkCounterLength(message) {
	if (message === 'next') {
		counter++;
		chrome.bookmarks.getTree(function(data) {
			console.log('next checkCounterLength');
			//console.log('music length:', music.length);
			loadBookmarks(data, function() {
				if (counter >= music.length - 1) {
					counter = 0;
				}
			});
		});
	} else if (message === 'prev') {
		counter--;
		chrome.bookmarks.getTree(function(data) {
			console.log('prev checkCounterLength');
			//console.log('music length:', music.length);
			loadBookmarks(data, function() {
				if (counter < 0) {
					counter = music.length - 1;
				}	
			});
		});
	} else {
		throw console.log('IllegalArgumentException'); // temp for now
	}
}

function isYoutubeVideo(url) {
	console.log('url substring test', url.substring(url.indexOf('.') + 1, url.indexOf('e') + 1));
	if (url.substring(url.indexOf('.') + 1, url.indexOf('e') + 1) === 'youtube') {
		return true;
	}
	return false;
}

function loadNewVideo() {
	chrome.bookmarks.getTree(function(data) {
		loadBookmarks(data, function () {
			console.log('counter', counter);
			if (isYoutubeVideo(music[counter].url)) {
				var nextVideoId = music[counter].url.substring((music[counter].url.indexOf('=') + 1));
				console.log('nextVideo', nextVideoId);
				player.loadVideoById(nextVideoId);
				player.playVideo();
			}
		});
	});
}

/*function onVideoEnd() {
	if (!YT.PlayerState.PLAYING) {
		checkCounterLength('next');
		loadNewVideo();
	}
}*/

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
		'onStateChange': onPlayerStateChange,
		'onError': onPlayerError
	}
};

function onYouTubeIframeAPIReady() {
	music = [];
	chrome.bookmarks.getTree(function(data) {
		console.log('counter initial', counter);
		//console.log('data', data);
		loadBookmarks(data, function() {
			// sets video id to first song in bookmarks, gonna have to throw errors here if not youtube
			playerDetails.videoId = music[counter].url.substring((music[counter].url.indexOf('=') + 1));
			player = new YT.Player('player', playerDetails);
		});
	});
}

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

	// if video is done playing
	if (event.data === 0) {
		checkCounterLength('next');
		loadNewVideo();
	}

	if (event.data != YT.PlayerState.PLAYING) {
		//player.playVideo();
		//console.log()
	}
}

// the reason some of the urls aren't playing are because they aren't allowed to be embedded
// basically if error == 150 or 101 then we have to skip the video, tbh if there is any error skip
function onPlayerError(event) {
	return console.log('error', event);
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
		checkCounterLength(request.message);
		loadNewVideo();
		sendResponse({message: 'next received'});
	} else if (request.message === 'prev') {
		//player.previousVideo();
		checkCounterLength(request.message);
		loadNewVideo();
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
