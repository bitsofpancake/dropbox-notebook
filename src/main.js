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
		Dropbox.connect(() => {
			this.setState({ connected: true });
			this.initSync();
		});
	},
	
	initSync: function () {
		Dropbox.list(listing => this.setState({ listing: listing }));
	},
	
	setCurrent: function (file) {
		this.setState({ current: file });
		Dropbox.load(file.path, contents => {
			file.contents = contents;
			this.forceUpdate();
		});
	},
	
	render: function () {
		if (this.state.listing)
			return (
				<div>
					<h1>Welcome, {localStorage.uid}!</h1>
					<ul>
						{this.state.listing.map(file => (
							<li
								onClick={() => this.setCurrent(file)}
								style={ this.state.current === file ? {fontWeight: 'bold'} : {} }
							>
								{file.path}
							</li>
						))}
					</ul>
					<pre>
						{JSON.stringify(this.state.current, null, 4)}
					</pre>
				</div>
			);
		else if (this.state.connected)
			return (
				<h1>loading {localStorage.uid}</h1>
			);
		else
			return (
				<button onClick={this.connectDropbox}>Connect</button>
			);
	}
});

React.renderComponent(
	<Notebook />,
	document.getElementById('main')
);