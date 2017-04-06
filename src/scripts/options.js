/**
 * options.js
 */
(function() {
    'use strict';
    // as soon as we render the page
    window.onload = function() {
        chrome.runtime.sendMessage({message: 'load bookmarks'}, function(response) {
            console.log(response.message); // todo, write to page in here
        });
    }
})(this);