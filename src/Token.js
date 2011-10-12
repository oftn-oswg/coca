"use strict";

if (typeof require === "function") {
	var Trie = require ("./Trie");
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

Token.prototype.diagnostic = function(type, value) {
	if (!arguments.length) {
		type = this.type;
		value = this.value;
	}
	switch (type) {
	case Token.WHITESPACE: switch (value) {
		case 9:  return "horizontal tab";
		case 10: return "newline";
		case 11: return "vertical tab";
		case 12: return "form feed";
		case 32: return "space";
		default: return "whitespace" +
			(value ? " (unknown code "+value+")" : ""); }
		break;
	case Token.IDENTIFIER:
		return "identifier" +
			(value ? " ("+value+")" : "");
	case Token.STRING_LITERAL:
		return "string literal" +
			(value ? " (\"" + value + "\")" : "");
	default:
		return Token.lookup[type] || "(unknown token)";
	}
};

Token.prototype.must_be = function(self, type, value) {
	// TODO: Simplify this
	
	if (this.type !== type) {
		throw new ParserError (self, "Unexpected "+this.diagnostic ()+", expecting "+this.diagnostic (type, value));
	}

	if (typeof value !== "undefined" && this.value !== value) {
		throw new ParserError (self, "Unexpected "+this.diagnostic ()+", expecting "+this.diagnostic (type, value));
	}
};

Token.lookup = [];
Token.keywords = {};
Token.punctuators = new Trie ();


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
		if (punctuators.hasOwnProperty (punc)) {
			Token[punc] = index;
			Token.lookup[index] = punctuators[punc];

			Token.punctuators.add (punctuators[punc], index);

			index++;
		}
	}

})();


if (typeof module === "object") {
	module.exports = Token;
}
