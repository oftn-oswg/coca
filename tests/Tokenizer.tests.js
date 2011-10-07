"use strict";

module ("Tokenizer");

test ("Greedy matching 'a+++++a;'", function() {
	var t = new Tokenizer(new Source ("a+++++a;"));
	var result = [
		Token.IDENTIFIER,
		Token.PUNC_INCREMENT,
		Token.PUNC_INCREMENT,
		Token.PUNC_PLUS,
		Token.IDENTIFIER,
		Token.PUNC_SEMICOLON
	];
	
	var tok, i = 0;
	while (tok = t.consume ()) {
		equal (tok.type, result[i++], "Test returned token");
	}
});

test ("Unterminated string literals don't tokenize", function() {
	raises (function () {
		new Tokenizer(new Source ("\"hello world")).consume();
	}, /Unterminated string literal/, "Raises \"Unterminated string literal\" error.");
});

test ("Unterminated comments don't tokenize", function() {
	raises (function () {
		new Tokenizer(new Source ("/*")).consume();
	}, /Unterminated comment/, "Raises \"Unterminated comment\" error.");
});

test ("Tokenizer#stringify should create surrogate pairs", function () {
	var source = [0x10000, 0x107FF, 0x10FFFF];
	var result = ["\uD800\uDC00", "\uD801\uDFFF", "\uDBFF\uDFFF"];

	for (var i = 0; i < source.length; i++) {
		equal(Tokenizer.prototype.stringify ([source[i]]), result[i], "encode " + source[i].toString(16));
	}
});
