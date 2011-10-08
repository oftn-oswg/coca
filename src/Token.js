"use strict";

if (typeof require === "function") {
	var Parser = require ("./Parser");
	var ParserError = Parser.ParserError;
}

var Token = function(type, value) {
	this.type = type;
	this.value = value;
};

Token.prototype.must_be = function(type, value) {
	if (this.type !== type) {
		throw new ParserError ("Unexpected token, expecting a different one.");
	} else if (arguments.length > 1 && this.value !== value) {
		throw new ParserError ("Unexpected token, expecting a different one.");
	}
};

Token.keywords = {};

/* Token types */
(function() {
	var index = 0;
	var types = ["WHITESPACE", "IDENTIFIER", "STRING_LITERAL", "PUNC_ARROW", "PUNC_ASS", "PUNC_ASS_BITWISE_LEFT", "PUNC_ASS_BITWISE_OR", "PUNC_ASS_BITWISE_RIGHT", "PUNC_ASS_BITWISE_XOR", "PUNC_ASS_BITWISE_AND", "PUNC_ASS_DIV", "PUNC_ASS_MINUS", "PUNC_ASS_MOD", "PUNC_ASS_MUL", "PUNC_ASS_PLUS", "PUNC_ASTERISK", "PUNC_BITWISE_AND", "PUNC_BITWISE_LEFT", "PUNC_BITWISE_NOT", "PUNC_BITWISE_OR", "PUNC_BITWISE_RIGHT", "PUNC_BITWISE_XOR", "PUNC_BRAC_CLOSE", "PUNC_BRAC_OPEN", "PUNC_COMMA", "PUNC_CURLY_CLOSE", "PUNC_CURLY_OPEN", "PUNC_DECREMENT", "PUNC_DIV", "PUNC_DOT", "PUNC_ELLIPSIS", "PUNC_HASH", "PUNC_HASH_DOUBLE", "PUNC_INCREMENT", "PUNC_IS_EQUAL", "PUNC_IS_GT", "PUNC_IS_GTE", "PUNC_IS_LT", "PUNC_IS_LTE", "PUNC_IS_NOT", "PUNC_LOGICAL_AND", "PUNC_LOGICAL_NOT", "PUNC_LOGICAL_OR", "PUNC_MINUS", "PUNC_MOD", "PUNC_PAREN_CLOSE", "PUNC_PAREN_OPEN", "PUNC_PLUS", "PUNC_SEMICOLON", "PUNC_TERNARY", "PUNC_TERNARY_COLON"];
	var keywords = ["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","inline","int","long","register","restrict","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","_Bool","_Complex","_Imaginary"];
	var types_len = types.length;
	var keywords_len = keywords.length;

	for (var i = 0; i < types_len; i++) {
		Token[types[i]] = index++;
	}

	for (var i = 0; i < keywords_len; i++) {
		Token["KEYWORD_" + keywords[i]] =
			Token.keywords[keywords[i]] = index++;
	}
})();


Token.punctuators = {
	91: { value: Token.PUNC_BRAC_OPEN },
	93: { value: Token.PUNC_BRAC_CLOSE },
	40: { value: Token.PUNC_PAREN_OPEN },
	41: { value: Token.PUNC_PAREN_CLOSE },
	123: { value: Token.PUNC_CURLY_OPEN },
	125: { value: Token.PUNC_CURLY_CLOSE },
	46: { value: Token.PUNC_DOT,
		46: { 46: { value: Token.PUNC_ELLIPSIS }}},
	45: { value: Token.PUNC_MINUS,
		62: { value: Token.PUNC_ARROW },
		45: { value: Token.PUNC_DECREMENT },
		61: { value: Token.PUNC_ASS_MINUS }},
	43: { value: Token.PUNC_PLUS,
		43: { value: Token.PUNC_INCREMENT },
		61: { value: Token.ASS_PLUS }},
	38: { value: Token.PUNC_BITWISE_AND,
		38: { value: Token.PUNC_LOGICAL_AND },
		61: { value: Token.PUNC_ASS_BITWISE_AND }},
	42: { value: Token.PUNC_ASTERISK,
		61: { value: Token.PUNC_ASS_MUL }},
	126: { value: Token.PUNC_BITWISE_NOT },
	33: { value: Token.PUNC_LOGICAL_NOT,
		61: { value: Token.PUNC_IS_NOT }},
	47: { value: Token.PUNC_DIV,
		61: { value: Token.PUNC_ASS_DIV }},
	37: { value: Token.PUNC_MOD,
		61: { value: Token.PUNC_ASS_MOD },
		62: { value: Token.PUNC_CURLY_CLOSE },
		58: { value: Token.PUNC_HASH,
			37: { 58: { value: Token.PUNC_HASH_DOUBLE }}}},
	60: { value: Token.PUNC_IS_LT,
		60: { value: Token.PUNC_BITWISE_LEFT,
			61: { value: Token.PUNC_ASS_BITWISE_LEFT }},
		61: { value: Token.PUNC_IS_LTE },
		58: { value: Token.PUNC_BRAC_OPEN },
		37: { value: Token.PUNC_CURLY_OPEN }},
	62: { value: Token.PUNC_IS_GT,
		62: { value: Token.PUNC_BITWISE_RIGHT,
			61: { value: Token.PUNC_ASS_BITWISE_RIGHT }},
		61: { value: Token.PUNC_IS_GTE }},
	61: { value: Token.PUNC_ASS,
		61: { value: Token.PUNC_IS_EQUAL }},
	94: { value: Token.PUNC_BITWISE_XOR,
		61: { value: Token.PUNC_ASS_BITWISE_XOR }},
	124: { value: Token.PUNC_BITWISE_OR,
		124: { value: Token.PUNC_LOGICAL_OR },
		61: { value: Token.PUNC_ASS_BITWISE_OR }},
	63: { value: Token.PUNC_TERNARY },
	58: { value: Token.PUNC_TERNARY_COLON,
		62: { value: Token.PUNC_BRAC_CLOSE }},
	59: { value: Token.PUNC_SEMICOLON },
	44: { value: Token.PUNC_COMMA },
	35: { value: Token.PUNC_HASH,
		35: { value: Token.PUNC_HASH_DOUBLE }}
};



if (typeof module === "object") {
	module.exports = Token;
}
