/** @jsx */
var EventEmitter = require('events').EventEmitter;

class DropboxSync extends EventEmitter {
	constructor(dropbox, directory) {
		this._db = dropbox;
		this._directory = directory;
		this._key = 'cache' + this._db.uid + '$' + this._directory;
		
		// Start syncing with Dropbox!
		setTimeout(() => this._startRefresh(), 0);
	}

	refreshFromLocal() {
		var json = localStorage[this._key];
		if (json) {
			var data = JSON.parse(json);
			if (!this._data || data.date > this._data.date) {
				console.log('refreshed from local');
				this._data = data;
				this.emit('update', data);
			}
		}
	}

	refreshFromServer(override) {
		if (override || !this._data || Date.now() > this._data.date + 50000) {
			this._db.list(this._directory).then(listing => {
				console.log('refreshed from server');
				var data = this._data = {
					date: Date.now(),
					listing: listing
				};
				localStorage[this._key] = JSON.stringify(data);
				this.emit('update', data);
			});
			
			// Save a placeholder so we don't make multiple requests.
			this._data = {
				date: Date.now()
			};
		}
	}
	
	_startRefresh() {
		this.refreshFromLocal();
		this.refreshFromServer();
		setTimeout(() => this._startRefresh(), 5000 * (0.9 + Math.random() * 0.2));
	}
}

module.exports = DropboxSync;