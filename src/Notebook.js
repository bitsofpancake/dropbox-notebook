/** @jsx React.DOM */

var Dropbox = require('./Dropbox');
var DropboxSync = require('./DropboxSync');
var Editor = require('./Editor');
var React = require('react');

function throttle(fn) {
	var to;
	var args = false;
	return function () {
		var self = this;
		clearTimeout(to);
		args = [].slice.call(arguments);
		to = setTimeout(function () { fn.apply(self, args) }, 5000);
	};
}

var Notebook = React.createClass({
	getInitialState: function () {		
		this.db = new Dropbox('1nghqb9dkbfv5gj', localStorage.uid, localStorage.token);
		this.db.once('connected', (uid, token) => {
			localStorage.uid = uid;
			localStorage.token = token;
			this.setState({ connected: true });
			
			this.dbSync = new DropboxSync(this.db, '/');
			this.dbSync.on('update', data => {
				this.setState({
					listing: data.listing,
					date: data.date
				});
			});
		});
		
		return {
			connected: false,
			listing: false,
			date: 0,
			currentFile: null
		};
	},
	
	// Sets the current file.
	setCurrentFile: function (file) {
		this.setState({
			currentFile: file,
			currentFileContents: false
		});
		this.db.download(file.path).then(contents => {
			if (file.path === this.state.currentFile.path)
				this.setState({ currentFileContents: contents });
		});
	},
	
	onEdit: throttle(function (value) {
		//this.setState({ currentFileContents: e.target.value });
		this.db.upload(
			this.state.currentFile.path,
			value, //this.state.currentFileContents,
			this.state.currentFile.rev
		);
	}),
	
	render: function () {
		if (!this.state.connected)
			return (
				<button onClick={this.db.connect}>Connect</button>
			);
			
		if (!this.state.listing)
			return (
				<h1>loading... ({this.db.uid})!</h1>
			);
		
		if (this.state.currentFile)
			var editing = (
				<div>						
					<pre>
						{JSON.stringify(this.state.currentFile, null, 4)}
					</pre>
					{
						typeof this.state.currentFileContents === 'string'
							? <Editor initialValue={this.state.currentFileContents} onChange={this.onEdit} />
							: 'loading...'
					}
				</div>
			);
		
		return (
			<div>
				<h1>Welcome, {this.db.uid}!</h1>
				<i>Last updated: {this.state.date ? (new Date(this.state.date)).toLocaleString() : 'never'}</i>
				<ul>
					{this.state.listing.map(file => (
						<li
							key={file.path}
							onClick={() => this.setCurrentFile(file)}
							style={ this.state.currentFile && this.state.currentFile.path === file.path ? {fontWeight: 'bold'} : {} }>
							{file.path}
						</li>
					))}
				</ul>
				{editing}
			</div>
		);
	}
});

module.exports = Notebook;