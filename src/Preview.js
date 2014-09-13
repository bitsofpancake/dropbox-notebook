/** @jsx React.DOM */

var marked = require('marked');
var React = require('react');

var Preview = React.createClass({
	render: function () {
		console.log(marked(this.props.markdown));
		return <div dangerouslySetInnerHTML={{ __html: marked(this.props.markdown) }} />;
    }
});

module.exports = Preview;