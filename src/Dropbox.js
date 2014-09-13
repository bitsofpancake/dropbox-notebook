/** @jsx */
var EventEmitter = require('events').EventEmitter;
var querystring = require('querystring');

function addParams(url, params) {
	return url + '?' + querystring.stringify(params);
}

class Dropbox extends EventEmitter {
	constructor(clientId, uid, token) {
		this.uid = uid;
		this._clientId = clientId;
		this._token = token;
		
		if (token)
			setTimeout(() => this.emit('connected', uid, token), 0);
	}

	connect() {
		chrome.identity.launchWebAuthFlow(
			{
				url: addParams(
					'https://www.dropbox.com/1/oauth2/authorize',
					{
						'response_type': 'token',
						'client_id': this._clientId,
						'redirect_uri': chrome.identity.getRedirectURL()
					}
				),
				interactive: true
			},
			url => {
				var data = querystring.parse(url.split('#')[1]);
				this.emit('connected', this.uid = data['uid'], this._token = data['access_token']);
			}
		)
	}

	list(path) {
		return this._call('https://api.dropbox.com/1/metadata/auto/' + path.replace(/^\//, ''))
			.then(data => JSON.parse(data)['contents']);
	}

	download(path) {
		return this._call('https://api-content.dropbox.com/1/files/auto/' + path.replace(/^\//, ''));
	}
	
	upload(path, file, parentRevision) {
		return this._call('https://api-content.dropbox.com/1/files_put/auto/' + path.replace(/^\//, ''), {
			'parent_rev': parentRevision
		}, file);
	}
	
	_call(endpoint, params, data) {
		params = params || {};
		params['access_token'] = this._token;
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
			xhr.open(data ? 'POST' : 'GET', addParams(endpoint, params));
			xhr.send(data);
		});
	}
};

module.exports = Dropbox;