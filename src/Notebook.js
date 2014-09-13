/** @jsx React.DOM */

var Dropbox = require('./Dropbox');
var React = require('react');

var Notebook = React.createClass({
	getInitialState: function () {
		Dropbox.on('connect', () => {
			this.setState({ connected: true });
		});
		Dropbox.on('updateListing', (listing, lastUpdate) => {
			this.setState({ listing: listing, lastUpdate: lastUpdate });
		});
		
		setTimeout(Dropbox.init, 0);
		return {
			connected: false,
			listing: false,
			lastUpdate: 0,
		};
	},
	
	// Sets the current file.
	setCurrent: function (file) {
		this.setState({ current: file });
		Dropbox.load(file.path, contents => {
			file.contents = contents;
			this.forceUpdate();
		});
	},
	
	render: function () {
		if (!this.state.connected)
			return (
				<button onClick={Dropbox.connect}>Connect</button>
			);
			
		if (!this.state.listing)
			return (
				<h1>loading... ({localStorage.uid})</h1>
			);
		
		return (
			<div>
				<h1>Welcome, {localStorage.uid}!</h1>
				<i>Last updated: {this.state.lastUpdate ? (new Date(this.state.lastUpdate)).toLocaleString() : 'never'}</i>
				<ul>
					{this.state.listing.map(file => (
						<li
							key={file.path}
							onClick={() => this.setCurrent(file)}
							style={ this.state.current === file ? {fontWeight: 'bold'} : {} }>
							{file.path}
						</li>
					))}
				</ul>
				<pre>
					{JSON.stringify(this.state.current, null, 4)}
				</pre>
			</div>
		);
	}
});

module.exports = Notebook;