function addParams(url, params) {
	return url + '?' + 
		Object.keys(params).map(function (key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
		}).join('&');
}

function call(endpoint, params, callback) {
	params['access_token'] = localStorage.token;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState === 4)
			callback(this.responseText);
	};
	xhr.open('GET', addParams(endpoint, params));
	xhr.send(null);
}

var lastUpdate = 0;
var Dropbox = {
	init: function () {
		if (localStorage.token) {
			Dropbox.onConnect(localStorage.uid, localStorage.token);

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
	},
	
	connect: function () {
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
	},
	
	list: function (callback) {
		call('https://api.dropbox.com/1/metadata/auto/', {}, function (data) {
			callback(JSON.parse(data)['contents']);
		});
	},
	
	load: function (path, callback) {
		call('https://api-content.dropbox.com/1/files/auto/' + path, {}, callback);
	},
	
	listFromCache: function () {
		if (localStorage.listing)
			Dropbox.onUpdateListing(JSON.parse(localStorage.listing), lastUpdate = +localStorage.lastUpdate);
	},
	
	listFromServer: function () {
		Dropbox.list(function (listing) {
			localStorage.lastUpdate = lastUpdate = Date.now();
			localStorage.listing = JSON.stringify(listing);
			Dropbox.onUpdateListing(listing, +localStorage.lastUpdate);
		});
	},
	
	onUpdateListing: function (listing, lastUpdate) {},
	onConnect: function (uid, token) {}
};