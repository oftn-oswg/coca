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

test ("Character constants lexing", function() {
	var tokenizer = new Tokenizer(new Source("'a'"));
	var token = tokenizer.consume ();
	equal (token.type, Token.CHAR_CONST, "<< 'a' >> type is character constant");
	equal (token.value, 97, "<< 'a' >> value is 'a'");
	equal (token.extra, false, "<< 'a' >> is not wide");

	tokenizer = new Tokenizer (new Source ("L'a'"));
	token = tokenizer.consume ();
	equal (token.type, Token.CHAR_CONST, "<< L'a' >> type is character constant");
	equal (token.value, 97, "<< L'a' >> value is 'a'");
	equal (token.extra, true, "<< L'a' >> is wide");

	raises (function() {
		var tokenizer = new Tokenizer (new Source ("'"));
		tokenizer.consume ();
	}, /Unterminated character constant/, "<< ' >> raises unterminated constant error");

	raises (function() {
		var tokenizer = new Tokenizer (new Source ("'f"));
		tokenizer.consume ();
	}, /Unterminated character constant/, "<< 'f >> raises unterminated constant error");

	raises (function() {
		var tokenizer = new Tokenizer (new Source ("'good swagg'"));
		tokenizer.consume ();
	}, /Too many characters/, "<< 'foo' >> raises too many characters error");
});