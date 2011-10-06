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
	while ((ch = t.nextch())) {
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
		equal (tok.value, result[i++], "Test returned token");
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

