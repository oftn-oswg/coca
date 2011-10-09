"use strict";

if (typeof require === "function") {
	var Parser = require ("./Parser");
	var ParserError = Parser.ParserError;
}

var Token = function(type, value, extra) {
	this.type = type;
	this.value = value;
	this.extra = extra;
};

Token.prototype.toString = function() {
	switch (this.type) {
	case Token.WHITESPACE:
		return String.fromCharCode (this.value);
	case Token.IDENTIFIER:
		return this.value;
	case Token.CHAR_CONST:
		return (this.extra ? "L'" : "'") +
			String.fromCharCode (this.value).replace (/'\\/g, "\\$&") + "'";
	case Token.STRING_LITERAL:
		return (this.extra ? "L\"" : "\"") +
			this.value.replace (/"\\/g, "\\$&") + "\"";
	default:
		return Token.lookup[this.type];
	}
};

Token.prototype.must_be = function(type, value) {
	if (this.type !== type) {
		throw new ParserError ("Unexpected token, expecting a different one.");
	} else if (arguments.length > 1 && this.value !== value) {
		throw new ParserError ("Unexpected token, expecting a different one.");
	}
};

Token.lookup = [];
Token.keywords = {};
Token.punctuators = {};


/* Build necessary types */
(function() {
	var keywords, punctuators, index = 0;
	
	keywords = ["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","inline","int","long","register","restrict","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","_Bool","_Complex","_Imaginary"];
	punctuators = {PUNC_ARROW: "->", PUNC_ASS: "=", PUNC_ASS_BITWISE_LEFT: "<<=", PUNC_ASS_BITWISE_OR: "|=", PUNC_ASS_BITWISE_RIGHT: ">>=", PUNC_ASS_BITWISE_XOR: "^=", PUNC_ASS_BITWISE_AND: "&=", PUNC_ASS_DIV: "/=", PUNC_ASS_MINUS: "-=", PUNC_ASS_MOD: "%=", PUNC_ASS_MUL: "*=", PUNC_ASS_PLUS: "+=", PUNC_ASTERISK: "*", PUNC_BITWISE_AND: "&", PUNC_BITWISE_LEFT: "<<", PUNC_BITWISE_NOT: "~", PUNC_BITWISE_OR: "|", PUNC_BITWISE_RIGHT: ">>", PUNC_BITWISE_XOR: "^", PUNC_BRAC_CLOSE: "]", PUNC_BRAC_OPEN: "[", PUNC_COMMA: ",", PUNC_CURLY_CLOSE: "}", PUNC_CURLY_OPEN: "{", PUNC_DECREMENT: "--", PUNC_DIV: "/", PUNC_DOT: ".", PUNC_ELLIPSIS: "...", PUNC_HASH: "#", PUNC_HASH_DOUBLE: "##", PUNC_INCREMENT: "++", PUNC_IS_EQUAL: "==", PUNC_IS_GT: ">", PUNC_IS_GTE: ">=", PUNC_IS_LT: "<", PUNC_IS_LTE: "<=", PUNC_IS_NOT: "!=", PUNC_LOGICAL_AND: "&&", PUNC_LOGICAL_NOT: "!", PUNC_LOGICAL_OR: "||", PUNC_MINUS: "-", PUNC_MOD: "%", PUNC_PAREN_CLOSE: ")", PUNC_PAREN_OPEN: "(", PUNC_PLUS: "+", PUNC_SEMICOLON: ";", PUNC_TERNARY: "?", PUNC_TERNARY_COLON: ":"};

	/* Add tokens which aren't automated, give them unique ids */
	Token.WHITESPACE = index++;
	Token.IDENTIFIER = index++;
	Token.CHAR_CONST = index++;
	Token.STRING_LITERAL = index++;

	/* Add keywords */
	for (var i = 0, len = keywords.length; i < len; i++) {

		Token["KEYWORD_" + keywords[i]] = index;
		Token.keywords[keywords[i]] = index;
		Token.lookup[index] = keywords[i];

		index++;
	}


	/* Add punctuators and build trie */
	for (var punc in punctuators) {

		Token[punc] = index;
		Token.lookup[index] = punctuators[punc];

		(function self(string, object, value) {
			var ch, child;

			if (string.length === 0) {
				object.value = value;
				return;
			}

			ch = string.charCodeAt (0);
			child = object[ch] || (object[ch] = {});

			self (string.substring (1), child, value);

		})(punctuators[punc], Token.punctuators, index);

		index++;
	}

})();


if (typeof module === "object") {
	module.exports = Token;
}
