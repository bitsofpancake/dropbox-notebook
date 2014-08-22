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
		Dropbox.connect(function()  {
			this.setState({ connected: true });
			this.initSync();
		}.bind(this));
	},
	
	initSync: function () {
		Dropbox.list(function(listing)  {return this.setState({ listing: listing });}.bind(this));
	},
	
	setCurrent: function (file) {
		this.setState({ current: file });
		Dropbox.load(file.path, function(contents)  {
			file.contents = contents;
			this.forceUpdate();
		}.bind(this));
	},
	
	render: function () {
		if (this.state.listing)
			return (
				React.DOM.div(null, 
					React.DOM.h1(null, "Welcome, ", localStorage.uid, "!"), 
					React.DOM.ul(null, 
						this.state.listing.map(function(file)  
							{return React.DOM.li({
								onClick: function()  {return this.setCurrent(file);}.bind(this), 
								style:  this.state.current === file ? {fontWeight: 'bold'} : {}
							}, 
								file.path
							);}.bind(this)
						)
					), 
					React.DOM.pre(null, 
						JSON.stringify(this.state.current, null, 4)
					)
				)
			);
		else if (this.state.connected)
			return (
				React.DOM.h1(null, "loading ", localStorage.uid)
			);
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