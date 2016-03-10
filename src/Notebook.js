/** @jsx React.DOM */

var Dropbox = require('./Dropbox');
var DropboxSync = require('./DropboxSync');
var Editor = require('./Editor');
var Preview = require('./Preview');
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
		console.log(file);
		this.db.download(file.path).then(contents => {
			if (file.path === this.state.currentFile.path)
				this.setState({ currentFileContents: contents });
		});
	},
	
	onEdit: function (value) {
		this.setState({ currentFileContents: value });
		this.save(value);
	},
	
	save: throttle(function (value) {
		this.db.upload(
			this.state.currentFile.path,
			value//, //this.state.currentFileContents,
			//this.state.currentFile.rev
		);
	}),
	
	createFile: function () {
		var newFile = {
			path: '/' + prompt('Give your file a name.')
		};
		
		if (this.state.listing.some(file => file.path === newFile.path))
			return alert('This file already exists!');
		
		this.setState({
			listing: this.state.listing.concat([newFile]),
			currentFile: newFile,
			currentFileContents: ''
		});
	},
	
	render: function () {
		if (!this.state.connected)
			return (
				<button onClick={() => this.db.connect()}>Connect</button>
			);
			
		if (!this.state.listing)
			return (
				<h1>loading... ({this.db.uid})!</h1>
			);
		
		return (
			<div className="container">
				<div className="listing">
					<ul>
						{this.state.listing.map(file => (
							<li
								key={file.path}
								onClick={() => this.setCurrentFile(file)}
								title={file.path}
								className={this.state.currentFile && this.state.currentFile.path === file.path ? 'selected' : ''}>
								{file.path}
							</li>
						))}
						
						<li className="command" onClick={this.createFile}>add new file</li>
						<li className="command" onClick={() => this.dbSync.refreshFromServer(true)}>refresh listing</li>
					</ul>
				</div>
				
				<Editor className="editor" value={this.state.currentFileContents || ''} onChange={this.onEdit} />
				<Preview className="preview" markdown={this.state.currentFileContents || ''} />
			</div>
		);
	}
});

module.exports = Notebook;