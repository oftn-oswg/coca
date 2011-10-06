"use strict";

module ("SourceStream");
test("Ending backslash removal", function() {

	var source = "f\nop \\\nba\\z";
	var stream = new SourceStream(null, source);

	var result = "f\nop ba\\z";
	//var lines = [1, 1, 2, 2, 2, 3, 3, 3, 3];
	//var columns = [1, 2, 1, 2, 3, 1, 2, 3, 4];

	var ch, cursor = 0;
	while ((ch = stream.nextch())) {
		equal (String.fromCharCode(ch), result.charAt(cursor), "Test character @ "+cursor);
		//equal (stream.line, lines[cursor], "Test line number @ "+cursor);
		//equal (stream.column, columns[cursor], "Test column number @ "+cursor);
		cursor++;
	}
});
