"use strict";

module ("Source");

function decode_simple (string) {
	return Array.prototype.map.call (string,
		function (ch) { return ch.charCodeAt(0); });
}

function source_match (input, output) {
	var ch, source, index = 0;
	
	source = new Source (input);
	while (ch = source.nextch (), ch != -1) {
		equal (ch, output[index], "Test character @ "+index);
		index++;
	}
}

function source_error (input, error, msg) {
	raises (function() {
		var source, ch;

		source = new Source (input);
		while (ch = source.nextch (), ch != -1) {
			console.log (ch);
		}
	}, error, msg);
}

test ("Escaped newline removal", function() {
	source_match ("f\nop \\\nba\\z", decode_simple ("f\nop ba\\z"));
});

test ("UTF-16 surrogates are converted", function() {
	source_match ("\uD800\uDC00\uD800\uDFFF\uDBFF\uDFFF", [0x10000,0x103FF,0x10FFFF]);
});

test ("Invalid surrogates throw error", function() {
	source_error ("\uDC00\uD800", /Invalid source input/, "Reversed surrogates should throw error");
});

test ("Surrogates advance column number appropriately", function() {
	var source = new Source ("\uD800\uDC00");
	var initialCursor = source.cursor;
	var initialColumn = source.column;

	source.nextch ();

	equal (source.cursor - initialCursor, 2, "Cursor is advanced by two bytes");
	equal (source.column - initialColumn, 1, "Column is advanced only once");
});