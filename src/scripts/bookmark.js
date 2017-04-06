/**
 * for right now this just loads the bookmarks for options.js, but I might refactor it to
 * also help player.js
 * @file bookmarks.js
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'load bookmarks') {
        chrome.bookmarks.getTree(function(bookmarks) {
            listBookmarks(bookmarks); 
            // here we can load all of the book marks then send them as a response obj to options.js
            // then options.js can do all of the rendering
        });
    }
});

function listBookmarks(bookmarks) {
    bookmarks.forEach(function(bookmark) {
        if (bookmark.url) {
            console.debug(bookmark.id + ' - ' + bookmark.title + ' - ' + bookmark.url);
        } else {
            console.log(bookmark.id, bookmark.title);
        }    
        if (bookmark.children) {
            console.log('children:\n');
            listBookmarks(bookmark.children);
            console.log('\n');
        }
    });
}
