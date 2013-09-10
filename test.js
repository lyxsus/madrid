var jsdom = require ('jsdom'),
	analyze = require ('./analyzer.js');

jsdom.env ({
	// url: 'http://banki.ru/forum/index.php?PAGE_NAME=message&FID=22&TID=57287',
	url: 'http://www.rbc.ru/',
	done: function (errors, window) {
		if (errors) {
			console.error (errors);
		} else {
			analyze (window.document);
		}
	}
});