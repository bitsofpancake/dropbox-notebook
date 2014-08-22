/** @jsx React.DOM */

var Notebook = React.createClass({
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
			return <h1>{localStorage.uid}</h1>;
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