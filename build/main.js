/** @jsx React.DOM */

var Notebook = React.createClass({displayName: 'Notebook',
	getInitialState: function () {
		return {
			connected: Dropbox.isConnected()
		};
	},
	
	connectDropbox: function () {
		Dropbox.connect(function () {
			this.setState({ connected: true });
		}.bind(this));
	},
	
	render: function () {
		if (this.state.connected)
			return React.DOM.h1(null, localStorage.uid);
		else
			return (
				React.DOM.button({onClick: this.connectDropbox}, "Connect")
			);
	}
});

React.renderComponent(
	Notebook(null),
	document.getElementById('main')
);