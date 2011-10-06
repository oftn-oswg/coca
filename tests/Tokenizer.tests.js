"use strict";

module ("Tokenizer");

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

