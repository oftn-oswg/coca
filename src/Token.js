"use strict";

var Token = function(type, value) {
	this.type = type;
	this.value = value;
};

Token.prototype.toString = function() {
	switch (this.type) {
	case Token.KEYWORD:
		return "Keyword";
	case Token.WHITESPACE:
		return String.fromCharCode (this.value);
	case Token.IDENTIFIER:
		return this.value;
	case Token.PUNCTUATOR:
		return "Punctuator";
	}
};

/* Token types */
Token.KEYWORD    = 1 << 0;
Token.IDENTIFIER = 1 << 1;
Token.WHITESPACE = 1 << 2;
Token.PUNCTUATOR = 1 << 3;
Token.STRING_LITERAL = 1 << 4;

/* Token keywords (6.4.1) */
Token.keywords = {};

(function(Token) {
	var keywords, index;

	keywords = ["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","inline","int","long","register","restrict","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","_Bool","_Complex","_Imaginary"];
	index = keywords.length;

	while (index--) {
		Token["KEYWORD_" + keywords[index]] =
			Token.keywords[keywords[index]] = new Token (Token.KEYWORD, index);
	}
})(Token);


/* Token punctuators (6.4.6)
 *
 * punctuator: one of
 *     [ ] ( ) { } . ->
 *     ++ -- & * + - ~ !
 *     / % << >> < > <= >= == != ^ | && ||
 *     ? : ; ...
 *     = *= /= %= += -= <<= >>= &= ^= |=
 *     , # ##
 *     <: :> <% %> %: %:%:
 */
Token.PUNC_ARROW             = new Token (Token.PUNCTUATOR, 1);
Token.PUNC_ASS               = new Token (Token.PUNCTUATOR, 2);
Token.PUNC_ASS_BITWISE_LEFT  = new Token (Token.PUNCTUATOR, 3);
Token.PUNC_ASS_BITWISE_OR    = new Token (Token.PUNCTUATOR, 4);
Token.PUNC_ASS_BITWISE_RIGHT = new Token (Token.PUNCTUATOR, 5);
Token.PUNC_ASS_BITWISE_XOR   = new Token (Token.PUNCTUATOR, 6);
Token.PUNC_ASS_BITWISE_AND   = new Token (Token.PUNCTUATOR, 7);
Token.PUNC_ASS_DIV           = new Token (Token.PUNCTUATOR, 8);
Token.PUNC_ASS_MINUS         = new Token (Token.PUNCTUATOR, 9);
Token.PUNC_ASS_MOD           = new Token (Token.PUNCTUATOR, 10);
Token.PUNC_ASS_MUL           = new Token (Token.PUNCTUATOR, 11);
Token.PUNC_ASS_PLUS          = new Token (Token.PUNCTUATOR, 12);
Token.PUNC_ASTERISK          = new Token (Token.PUNCTUATOR, 13);
Token.PUNC_BITWISE_AND       = new Token (Token.PUNCTUATOR, 14);
Token.PUNC_BITWISE_LEFT      = new Token (Token.PUNCTUATOR, 15);
Token.PUNC_BITWISE_NOT       = new Token (Token.PUNCTUATOR, 16);
Token.PUNC_BITWISE_OR        = new Token (Token.PUNCTUATOR, 17);
Token.PUNC_BITWISE_RIGHT     = new Token (Token.PUNCTUATOR, 18);
Token.PUNC_BITWISE_XOR       = new Token (Token.PUNCTUATOR, 19);
Token.PUNC_BRAC_CLOSE        = new Token (Token.PUNCTUATOR, 20);
Token.PUNC_BRAC_OPEN         = new Token (Token.PUNCTUATOR, 21);
Token.PUNC_COMMA             = new Token (Token.PUNCTUATOR, 22);
Token.PUNC_CURLY_CLOSE       = new Token (Token.PUNCTUATOR, 23);
Token.PUNC_CURLY_OPEN        = new Token (Token.PUNCTUATOR, 24);
Token.PUNC_DECREMENT         = new Token (Token.PUNCTUATOR, 25);
Token.PUNC_DIV               = new Token (Token.PUNCTUATOR, 26);
Token.PUNC_DOT               = new Token (Token.PUNCTUATOR, 27);
Token.PUNC_ELLIPSIS          = new Token (Token.PUNCTUATOR, 28);
Token.PUNC_HASH              = new Token (Token.PUNCTUATOR, 29);
Token.PUNC_HASH_DOUBLE       = new Token (Token.PUNCTUATOR, 30);
Token.PUNC_INCREMENT         = new Token (Token.PUNCTUATOR, 31);
Token.PUNC_IS_EQUAL          = new Token (Token.PUNCTUATOR, 32);
Token.PUNC_IS_GT             = new Token (Token.PUNCTUATOR, 33);
Token.PUNC_IS_GTE            = new Token (Token.PUNCTUATOR, 34);
Token.PUNC_IS_LT             = new Token (Token.PUNCTUATOR, 35);
Token.PUNC_IS_LTE            = new Token (Token.PUNCTUATOR, 36);
Token.PUNC_IS_NOT            = new Token (Token.PUNCTUATOR, 37);
Token.PUNC_LOGICAL_AND       = new Token (Token.PUNCTUATOR, 38);
Token.PUNC_LOGICAL_NOT       = new Token (Token.PUNCTUATOR, 39);
Token.PUNC_LOGICAL_OR        = new Token (Token.PUNCTUATOR, 40);
Token.PUNC_MINUS             = new Token (Token.PUNCTUATOR, 41);
Token.PUNC_MOD               = new Token (Token.PUNCTUATOR, 42);
Token.PUNC_PAREN_CLOSE       = new Token (Token.PUNCTUATOR, 43);
Token.PUNC_PAREN_OPEN        = new Token (Token.PUNCTUATOR, 44);
Token.PUNC_PLUS              = new Token (Token.PUNCTUATOR, 45);
Token.PUNC_SEMICOLON         = new Token (Token.PUNCTUATOR, 46);
Token.PUNC_TERNARY           = new Token (Token.PUNCTUATOR, 47);
Token.PUNC_TERNARY_COLON     = new Token (Token.PUNCTUATOR, 48);

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


if (typeof module !== "undefined") {
	module.exports = Token;
}
