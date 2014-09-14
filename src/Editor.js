/** @jsx React.DOM */

var CodeMirror = require('codemirror');
var React = require('react');
require('codemirror/mode/markdown/markdown');

var Editor = React.createClass({
	render: function () {
		return this.transferPropsTo(<div />);
    },

	componentDidUpdate: function () {
		if (this.cm && this.cm.getValue() !== this.props.value)
			this.cm.setValue(this.props.value);
	},

    componentDidMount: function () {
		this.cm = CodeMirror(this.getDOMNode(), {
			value: this.props.value,
			lineNumbers: false,
			lineWrapping: true,
			matchBrackets: true,
			indentUnit: 4,
			mode: 'text/x-markdown'
		});
		this.cm.on('change', cm => {
			if (this.props.onChange)
				this.props.onChange(cm.getValue());
		});
	}
});

module.exports = Editor;