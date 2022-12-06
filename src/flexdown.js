module.exports = {

	parse(text) {
		let result = {
			rows: [],
			options: {
				container: {
					border: true
				},
				items: [],
				headerRows: {}
			}
		};

		let lines = text.split("\n");
		if(lines.length==0) {
			return result;
		}

		let row = []
		result.rows.push(row)
		let column = ""
		for(let i=0; i<lines.length; i++) {
			if(lines[i].startsWith('%%')) {
				result.options = this.parseOptions(lines[i], result.options);
				if(result.options.header) {
					result.options.headerRows[result.rows.length-1] = true;
				}
			}
			else if(lines[i].startsWith("|")) {
				row.push(column);
				column = "";
			}
			else if(lines[i].startsWith('---')) {
				row.push(column);
				column = "";
				row = [];
				result.rows.push(row);
			}
			else {
				if (column.length > 0) {
					column += "\n";
				}
				column += lines[i];
			}
		}
		if(column.length > 0){
			row.push(column);
		}
		return result;
	},

	splitTrim(text, delimiter) {
		return text.split(delimiter).map(s=>{
			return s.trim();
		})
	},

	paramsMatch(params, key, value) {
		return params.length>=2 && params[0].startsWith(key) && params[1].startsWith(value);
	},

	parseOptions(text, options) {
		let params = this.splitTrim(text.substr(text.indexOf('%%') + 2), ':');
		// console.log(params);
		if(params[0] == 'flex') {
			params = this.splitTrim(params[1], ',');
			options.items = options.items.concat(params);
		}
		else if(params[0] == 'flex-all') {
			options.flexAll = params[1];
		}
		else if(params[0] == 'border') {
			options.container.border = !(params[1].startsWith('false') || params[1].startsWith('none'));
		}
		else if(this.paramsMatch(params, 'display', 'table')) {
			options.renderTable = true;
		}
		else if(params[0] == 'header') {
			options.header = true;
		}

		return options;
	},


	isPlainText(text) {
		return text.match(/[^\w\s\,\.]/) == null;
	},

	renderTable(data, el, createNode, renderMarkdown) {
		var table = createNode(el, 'table', ['flexdown']);

		for(let i=0; i<data.rows.length; i++) {
			var row = createNode(table, 'tr', []);
			var tag = data.options.headerRows[i] ? 'th' : 'td';
			for(let j=0; j<data.rows[i].length; j++) {
				var column = createNode(row, tag, []);
				renderMarkdown(data.rows[i][j], column);
			}
		}
	},

	renderFlexbox(data, el, createNode, renderMarkdown) {
		if(data.options.container.border) {
			el = createNode(el, 'div', ['flexdown-border']);
		}
		for(let i=0; i<data.rows.length; i++) {
			var rowClasses = data.options.headerRows[i] ? 
				['flexdown-row', 'flexdown-header-row'] :
				['flexdown-row'];
			var row = createNode(el, 'div', rowClasses);
			for(let j=0; j<data.rows[i].length; j++) {
				var column = createNode(row, 'div', ['flexdown-column']);
				if(j < data.options.items.length) {
					column.style = 'flex: ' + data.options.items[j];
				}
				else if(data.options.flexAll) {
					column.style = 'flex: ' + data.options.flexAll;
				}
				renderMarkdown(data.rows[i][j], column);
			}
		}
	},

	/**
	 * Render the parsed data. 
	 * 
	 * The function takes 2 functions:
	 * 1. Create a new node (eg html node) on the parent node, with tagName, and array of classes
	 * function(nodeElement, tagName, classes)
	 * 2. Render the markdown
	 * function(markdownText, node)
	 * @param {Object} data              The parsed data
	 * @param {Object} el.               The parent node (eg HTML node)
	 * @param {function} createNode      A function to create a new node
	 * @param {function} renderMarkdown  A fucntion to render markdown in the passed-in node
	 */
	render(data, el, createNode, renderMarkdown) {
		if(data.options.renderTable) {
			this.renderTable(data, el, createNode, renderMarkdown);
		}
		else {
			this.renderFlexbox(data, el, createNode, renderMarkdown);
		}
	},

	// For testing, returns an object for the rendered hierarchy.
	testRender(data) {
		var node = {tag:'parent', nodes:[]};
		this.render(data, node,
			function(node, tag, classes) {
				var newNode = {
					tag: tag,
					classes: classes,
					nodes: [],
					text: ''
				};
				node.nodes.push(newNode);
				return newNode;
			},
			function(markdownText, node) {
				node.text = markdownText;
			}
		);
		return node;
	}
}