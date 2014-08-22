/** @jsx React.DOM */

var Notebook = React.createClass({
	getInitialState: function () {
		if (Dropbox.isConnected()) {
			this.initSync();
		}
		
		return {
			connected: Dropbox.isConnected(),
			listing: false
		};
	},
	
	connectDropbox: function () {
		Dropbox.connect(function () {
			this.setState({ connected: true });
			Dropbox.initSync();
		});
	},
	
	initSync: function () {
		Dropbox.list(function (listing) {
			this.setState({ listing: listing });
		}.bind(this));
	},
	
	setCurrent: function (file) {
		this.setState({ current: file });
		Dropbox.load(file.path, function (contents) {
			file.contents = contents;
			this.forceUpdate();
		}.bind(this));
	},
	
	render: function () {
		var self = this;
		if (self.state.listing)
			return (
				<div>
					<h1>Welcome, {localStorage.uid}!</h1>
					<ul>
						{self.state.listing.map(function (file) {
							return (
								<li onClick={function () {
									self.setCurrent(file)
								}} style={ self.state.current === file ? {fontWeight: 'bold'} : {} }>{file.path}</li>
							);
						})}
					</ul>
					<pre>
						{JSON.stringify(self.state.current, null, 4)}
					</pre>
				</div>
			);
		else if (self.state.connected)
			return (
				<h1>loading {localStorage.uid}</h1>
			);
		else
			return (
				<button onClick={self.connectDropbox}>Connect</button>
			);
	}
});

React.renderComponent(
	<Notebook />,
	document.getElementById('main')
);