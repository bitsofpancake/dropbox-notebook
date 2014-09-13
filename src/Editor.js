/** @jsx React.DOM */

var CodeMirror = require('codemirror');
var React = require('react');

var Editor = React.createClass({
	render: function () {
		return <div />;
    },
	
	shouldComponentUpdate: function () {
		return false;
	},

    componentDidMount: function () {
		CodeMirror(this.getDOMNode(), {
			value: this.props.initialValue,
			lineNumbers: true,
			matchBrackets: true,
			indentUnit: 4,
			mode: 'text/x-markdown'
		}).on('change', cm => {
			if (this.props.onChange)
				this.props.onChange(cm.getValue());
		});
	}
});

module.exports = Editor;