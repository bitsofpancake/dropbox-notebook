/** @jsx React.DOM */

var Notebook = React.createClass({displayName: 'Notebook',
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
				React.DOM.div(null, 
					React.DOM.h1(null, "Welcome, ", localStorage.uid, "!"), 
					React.DOM.ul(null, 
						self.state.listing.map(function (file) {
							return (
								React.DOM.li({onClick: function () {
									self.setCurrent(file)
								}, style:  self.state.current === file ? {fontWeight: 'bold'} : {}}, file.path)
							);
						})
					), 
					React.DOM.pre(null, 
						JSON.stringify(self.state.current, null, 4)
					)
				)
			);
		else if (self.state.connected)
			return (
				React.DOM.h1(null, "loading ", localStorage.uid)
			);
		else
			return (
				React.DOM.button({onClick: self.connectDropbox}, "Connect")
			);
	}
});

React.renderComponent(
	Notebook(null),
	document.getElementById('main')
);