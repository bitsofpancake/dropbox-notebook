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

var Dropbox = {
	isConnected: function () {
		return !!localStorage.uid;
	},
	
	connect: function (callback) {
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
				
				if (localStorage.uid)
					callback();
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
	}
};