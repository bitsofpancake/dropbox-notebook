function addParams(url, params) {
	return url + '?' + 
		Object.keys(params).map(function (key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
		}).join('&');
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
	}
};