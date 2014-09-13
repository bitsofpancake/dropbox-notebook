/** @jsx */
var EventEmitter = require('events').EventEmitter;

function addParams(url, params) {
	return url + '?' + 
		Object.keys(params).map(function (key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
		}).join('&');
}

function call(endpoint, params) {
	params = params || {};
	params['access_token'] = localStorage.token;
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200)
					resolve(this.responseText);
				else
					reject(new Error(this.statusText));
			}
		};
		xhr.open('GET', addParams(endpoint, params));
		xhr.send(null);
	});
}

var lastUpdate = 0;
var Dropbox = new EventEmitter();
Dropbox.init = function () {
	if (localStorage.token) {
		Dropbox.emit('connect', localStorage.uid, localStorage.token);

		// Start syncing the listing with Dropbox.
		(function update() {
			// Reload from cache if the cache as been updated (e.g. from another tab).
			if (lastUpdate < +localStorage.lastUpdate)
				Dropbox.listFromCache();
			
			// Refresh stale data from Dropbox.
			if (+localStorage.lastUpdate < Date.now() - 50000)
				Dropbox.listFromServer();
				
			setTimeout(update, 5000 * (0.9 + Math.random() * 0.2));
		}());
	}
};

Dropbox.connect = function () {
	chrome.identity.launchWebAuthFlow(
		{
			url: addParams(
				'https://www.dropbox.com/1/oauth2/authorize',
				{
					'response_type': 'token',
					'client_id': '1nghqb9dkbfv5gj',
					'redirect_uri': chrome.identity.getRedirectURL()
				}
			),
			interactive: true
		},
		function (url) {
			var data = {};
			url.split('#')[1].split('&').forEach(function (param) {
				var pieces = param.split('=');
				data[pieces[0]] = pieces[1];
			});
			
			localStorage.uid = data['uid'];
			localStorage.token = data['access_token'];
			Dropbox.init();
		}
	)
};

Dropbox.list = function (path) {
	return call('https://api.dropbox.com/1/metadata/auto/' + path.replace(/^\//, '')).then(data => JSON.parse(data)['contents']);
};

Dropbox.load = function (path) {
	return call('https://api-content.dropbox.com/1/files/auto/' + path.replace(/^\//, ''));
};

Dropbox.listFromCache = function () {
	if (localStorage.listing)
		Dropbox.emit('updateListing', JSON.parse(localStorage.listing), lastUpdate = +localStorage.lastUpdate);
};

Dropbox.listFromServer = function () {
	Dropbox.list('/', function (listing) {
		localStorage.lastUpdate = lastUpdate = Date.now();
		localStorage.listing = JSON.stringify(listing);
		Dropbox.emit('updateListing', listing, +localStorage.lastUpdate);
	});
};

module.exports = Dropbox;