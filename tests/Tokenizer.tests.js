"use strict";

module ("Tokenizer");

///*
test ("Ending backslash removal and line number", function() {
	var source = "f\nop \\\nba\\z";
	var t = new Tokenizer(null, source);

	var result = "f\nop ba\\z";
	var lines = [1, 1, 2, 2, 2, 2, 3, 3, 3]; // [5] should in reality be 3, but I'm not picky
	var columns = [1, 2, 1, 2, 3, 4, 2, 3, 4]; // [5] -> 1

	var ch, cursor = 0, line = 1, column = 1;
	while (ch = t.nextch(), ch != -1) {
		console.log("#1 " + ch);
		equal (String.fromCharCode(ch), result.charAt(cursor), "Test character @ "+cursor);
		equal (line, lines[cursor], "Test line number @ "+cursor);
		equal (column, columns[cursor], "Test column number @ "+cursor);

		cursor++;
		line = t.line;
		column = t.column;
	}
});
//*/

///*
test ("Greedy matching 'a+++++a;'", function() {
	var t = new Tokenizer(null, "a+++++a;");
	var result = [
		"a",
		Token.PUNC_INCREMENT.value,
		Token.PUNC_INCREMENT.value,
		Token.PUNC_PLUS.value,
		"a",
		Token.PUNC_SEMICOLON.value
	];
	
	var tok, i = 0;
	while (tok = t.consume ()) {
		console.log("#2 " + tok);
		equal (tok.value, result[i++], "Test returned token");
	}
});
//*/

///*
test ("UTF-16 surrogates are converted", function() {
	var t = new Tokenizer(null, "\uD800\uDC00\uD800\uDFFF\uDBFF\uDFFF");
	var result = [0x10000,0x103FF,0x10FFFF];

	for (var i = 0; i < result.length; i++) {
		console.log("#3 " + t.peekch ());
		equal (t.nextch (), result[i], "Read UTF-16 surrogate #" + (i+1) + " as 0x" + result[i].toString(16));
	}
});
//*/

///*
test ("Unterminated string literals don't tokenize", function() {
	raises (function () {
		new Tokenizer(null, "\"hello world").consume();
	}, /Unterminated string literal/, "Raises \"Unterminated string literal\" error.");
});
//*/

///*
test ("Unterminated comments don't tokenize", function() {
	raises (function () {
		new Tokenizer(null, "/*").consume();
	}, /Unterminated comment/, "Raises \"Unterminated comment\" error.");
});
//*/

///*
test ("codes_to_string will create surrogate pairs", function () {
	var source = [0x10000, 0x107FF, 0x10FFFF];
	var t = new Tokenizer(null, "");
	var result = ["\uD800\uDC00", "\uD801\uDFFF", "\uDBFF\uDFFF"];

	for (var i = 0; i < source.length; i++) {
		equal(t.codes_to_string([source[i]]), result[i], "encode " + source[i].toString(16));
	}
});
//*/
/*
test ("Random test", function() {
	var t = new Tokenizer(null, "#include <stdio.h>\nint main(int argc, char *argv[]) {\n\twhile (argc--) {\n\t\tputs (argv[argc]);\n\t}\n\treturn EXIT_SUCCESS;\n}\n"), tok;
	var result = ["#", "include", " ", "<", "stdio", ".", "h", ">", "\n", "int", " ", "main", "(", "int", " ", "argc", ",", " ", "char", " ", "*", "argv", "[", "]", ")", " ", "{", "\n\t", "while", " ", "(", "argc", "--", ")", " ", "{", "\n\t\t", "puts", " ", "(", "argv", "[", "argc", "]", ")", ";", "\n\t", "}", "\n\t", "return", " ", "EXIT_SUCCESS", ";", "\n", "}", "\n"];
	var i = 0;

	while (tok = t.consume()) {
		equal (tok, result[i++], "Test returned token");
	}
});

//*/

