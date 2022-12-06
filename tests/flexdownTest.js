var FD = require('../src/flexdown');
var fs = require('fs');


function readFile(f) {
	let path = __dirname + '/' + f;
	return fs.readFileSync(path, 'utf8');
}
describe("Flexdown", () => {
	it("should render", () => {
		let data = FD.parse(readFile('data/test1.md'));
		console.log(data);
		console.log(JSON.stringify(FD.testRender(data), null, 4));
	});

	it("should render with options", () => {
		let data = FD.parse(readFile('data/test-with-options.md'));
		console.log(data);
		console.log(JSON.stringify(FD.testRender(data), null, 4));
	})

	it("should render a table", () => {
		let data = FD.parse(readFile('data/test-display-table.md'));
		console.log(data);
		console.log(JSON.stringify(FD.testRender(data), null, 4));
	})
})