/** @jsx React.DOM */

var Notebook = React.createClass({displayName: 'Notebook',
	getInitialState: function () {
		Dropbox.onConnect = function()  {
			this.setState({ connected: true });
		}.bind(this);
		
		Dropbox.onUpdateListing = function(listing, lastUpdate)  {
			this.setState({ listing: listing, lastUpdate: lastUpdate });
		}.bind(this);
		
		setTimeout(Dropbox.init, 0);
		return {
			connected: false,
			listing: false,
			lastUpdate: 0,
		};
	},
	
	setCurrent: function (file) {
		this.setState({ current: file });
		Dropbox.load(file.path, function(contents)  {
			file.contents = contents;
			this.forceUpdate();
		}.bind(this));
	},
	
	render: function () {
		if (!this.state.connected)
			return (
				React.DOM.button({onClick: Dropbox.connect}, "Connect")
			);
			
		if (!this.state.listing)
			return (
				React.DOM.h1(null, "loading... (", localStorage.uid, ")")
			);
		
		return (
			React.DOM.div(null, 
				React.DOM.h1(null, "Welcome, ", localStorage.uid, "!"), 
				React.DOM.i(null, "Last updated: ", this.state.lastUpdate ? (new Date(this.state.lastUpdate)).toLocaleString() : 'never'), 
				React.DOM.ul(null, 
					this.state.listing.map(function(file)  
						{return React.DOM.li({
							key: file.path, 
							onClick: function()  {return this.setCurrent(file);}.bind(this), 
							style:  this.state.current === file ? {fontWeight: 'bold'} : {}}, 
							file.path
						);}.bind(this)
					)
				), 
				React.DOM.pre(null, 
					JSON.stringify(this.state.current, null, 4)
				)
			)
		);
	}
});

React.renderComponent(
	Notebook(null),
	document.getElementById('main')
);