/** @jsx React.DOM */

var marked = require('marked');
var React = require('react');

var renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
	var out = '<a href="' + href + '"';
	if (title)
		out += ' title="' + title + '"';
	if (href.charAt(0) !== '#')
		out == ' target="_blank"';
	out += '>' + text + '</a>';
	return out;
};

marked.setOptions({
	//sanitize: true,
	tables: true,
	smartypants: true,
	renderer: renderer
});

var Preview = React.createClass({
	render: function () {
		return this.transferPropsTo(<div dangerouslySetInnerHTML={{ __html: marked(this.props.markdown) }} />);
    }
});

module.exports = Preview;