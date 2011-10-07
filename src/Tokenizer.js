"use strict";

/* Tokenizer
 * ---------
 * options -> Global options
 * string  -> Source code to stream from
 *
 * 6.4 Lexical elements
 * Syntax
 *
 * token:
 *     keyword
 *     identifier
 *     constant
 *     string-literal
 *     punctuator
 *
 * preprocessing-token:
 *     header-name
 *     identifier
 *     pp-number
 *     character-constant
 *     string-literal
 *     punctuator
 *     each non-white-space character that cannot be one of the above
 */

if (typeof require === "function") {
	var Token        = require ("./Token");
	var Preprocessor = require ("./Preprocessor");
}

var Tokenizer = function(source) {
	this.source = source;
};


Tokenizer.prototype.is_digit             = function(ch) { return ch >= 48 && ch <= 57; /* [0-9] */ };
Tokenizer.prototype.is_whitespace        = function(ch) { return ch === 32 || (ch >= 9 && ch <= 12); };
Tokenizer.prototype.is_octal_digit       = function(ch) { return ch >= 48 && ch <= 55; /* [0-7] */ };
Tokenizer.prototype.is_hexadecimal_digit = function(ch) { return (ch >= 48 && ch <= 57) || /* [0-9] */
                                                                 (ch >= 65 && ch <= 70) || /* [A-F] */
                                                                 (ch >= 97 && ch <= 102);  /* [a-f] */ };
Tokenizer.prototype.is_identifier_char   = function(ch) { return (ch >= 65 && ch <= 90) ||            /* [A-Z] */
                                                                 (ch >= 97 && ch <= 122) ||           /* [a-z] */
                                                                 (ch >= 48 && ch <= 57) || ch === 95; /* [0-9_] */};
/*
 * Consumes the next token from the stream,
 * and advances the stream for the next token.
 */
Tokenizer.prototype.consume = function() {
	var ch = this.source.peekch ();

	if (this.is_whitespace (ch))      return new Token (Token.WHITESPACE, this.source.nextch ());

	if (this.source.in_directive === Preprocessor.INCLUDE) {
		if (ch === 60) /* is-less-than */ return this.read_header_name (false);
	}
	if (this.source.in_directive !== Preprocessor.NO_DIRECTIVE) {
		if (ch === 46 ||
		    this.is_digit (ch))           return this.read_pp_number ();
	}

	if (this.is_digit (ch))           return this.read_number ();
	if (this.is_identifier_char (ch)) return this.read_identifier ();

	if (ch === 34) /* double-quote */ return this.read_string_literal ();
	if (ch === 39) /* single-quote */ return this.read_character_constant ();
	if (ch === -1) /* end-of-file  */ return null;

	if (ch === 47) /* forward slash */ {
		this.source.save ();
		this.source.nextch ();
		switch (this.source.nextch ()) {
		case 47: return this.read_bcpl_comment ();
		case 42: return this.read_block_comment ();
		}
		this.source.restore ();
	}

	// If all else fails, assume a punctuator.
	return this.read_punctuator ();
};

/*
 * Peeks the next token off the stream
 */
Tokenizer.prototype.lookahead = function() {
	var token;

	this.source.save ();
	token = this.consume ();
	this.source.restore ();

	return token;
};

Tokenizer.prototype.read_escape_sequence = function() {
	var ch, code = 0, max;

	ch = this.source.nextch ();
	switch (ch) {
	case 34: case 39: case 63: case 92: return ch; // Quotes, question mark, backslash
	case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: /* Octals */
		max = 3;
		while (max--) {
			code = code << 3 | (ch - 48);
			if (!this.is_octal_digit (this.source.peekch ())) break;
			ch = this.source.nextch ();
		}
		return code;
	case 85: case 117:
		/* \U, \u: Universal character names */
		var required = (ch === 85) ? 8 : 4, i = required;
		while (i--) {
			ch = this.source.nextch ();
			if (!this.is_hexadecimal_digit (ch)) {
				throw new ParserError (this, "Universal character name requires " + required + " hexadecimal digits");
			}
			code = code << 4 | ch - ((ch >= 48 && ch <= 57) ? 48 : (ch >= 65 && c <= 70) ? 55 : 87);
		}
		return code;
	case 97: return 7;   /* \a: Bell character */
	case 98: return 8;   /* \b: Backspace character */
	case 102: return 12; /* \f: Form feed character */
	case 110: return 10; /* \n: Newline character */
	case 114: return 13; /* \r: Carriage return */
	case 116: return 9;  /* \t: Tab character */
	case 118: return 11; /* \v: Vertical tab character */
	case 120:            /* \x: Hexadecimal magic */
		while (ch = this.source.peekch (), this.is_hexadecimal_digit (ch)) {
			code = code << 4 | ch - ((ch >= 48 && ch <= 57) ? 48 : (ch >= 65 && ch <= 70) ? 55 : 87);
			this.source.nextch ();
		}
		return code;
	default:
		throw new ParserError (this, "Unknown escape sequence", ch);
	}
};


Tokenizer.prototype.read_string_literal = function(wide) {
	var characters;

	this.source.nextch (); // Skip the starting quote
	characters = [];
	wide = wide || false;

	loop:
	for(;;) {
		switch (this.source.peekch ()) {
		case -1: throw new ParserError (this, "Unterminated string literal"); break;
		case 34:
			this.source.nextch ();
			break loop;
		case 92:
			this.source.nextch ();
			characters.push (this.read_escape_sequence ());
			break;
		default:
			characters.push (this.source.nextch ());
		}
	}

	return new Token (Token.STRING_LITERAL, this.stringify (characters), wide);
};

Tokenizer.prototype.read_punctuator = function() {
	var ch, punc, type;

	punc = Token.punctuators;
	type = null;

	while (ch = this.source.peekch (), punc = punc[ch]) {
		if (punc.value) type = punc.value;
		this.source.nextch ();
	}

	if (!type) {
		throw new ParserError (this, "Stray character in program", ch);
	}
	return new Token (type);
};

/* 6.4.2.1p2
 * An identifier is a sequence of nondigit characters (including the underscore _, the
 * lowercase and uppercase Latin letters, and other characters) and digits, which designates
 * one or more entities as described in 6.2.1. Lowercase and uppercase letters are distinct.
 * There is no specific limit on the maximum length of an identifier.
 */
Tokenizer.prototype.read_identifier = function() {
	var characters, name, type, ch;

	characters = [];

	while (ch = this.source.peekch (), this.is_identifier_char (ch)) {
		characters.push (this.source.nextch ());
	}
	name = this.stringify (characters);

	return Token.keywords[name] ?
		new Token (Token.keywords[name]) :
		new Token (Token.IDENTIFIER, name);
};

/* 6.4.9p2
 * Except within a character constant, a string literal, or a comment, the characters //
 * introduce a comment that includes all multibyte characters up to, but not including, the
 * next new-line character. The contents of such a comment are examined only to identify
 * multibyte characters and to find the terminating new-line character.
 */
Tokenizer.prototype.read_bcpl_comment = function() {
	var ch;

	while (ch = this.source.peekch (), ch !== 10 && ch !== -1)
		/* while ch is not a newline */
		this.source.nextch ();

	return new Token (Token.WHITESPACE, 32); // 5.1.1.2p3 "Each comment is replaced by one space character."
};

// 6.4.9p1
// Except within a character constant, a string literal, or a comment, the characters /*
// introduce a comment. The contents of such a comment are examined only to identify
// multibyte characters and to find the characters */ that terminate it.71)

Tokenizer.prototype.read_block_comment = function() {
	var slash, term = false;

	loop:
	for(;;) {
		switch (this.source.peekch ()) {
		case -1: throw new ParserError (this, "Unterminated comment");
		case 47: if (term) { this.source.nextch (); break loop; }
		case 42: term = true; break;
		default: term = false; break;
		}
		this.source.nextch ();
	}

	return new Token (Token.WHITESPACE, 32); // 5.1.1.2p3
};

Tokenizer.prototype.stringify = function(code_array) {
	var arr = code_array.reduce(function (a, ch) {
		if (ch >= 0x10000) {
			var hi, lo;
			hi = ((ch - 0x10000) >> 10)    + 0xD800;
			lo = ((ch - 0x10000) &  0x3FF) + 0xDC00;
			a.push (hi); a.push (lo);
		} else {
			a.push (ch);
		}
		return a;
	}, []);
	return String.fromCharCode.apply (null, arr);
};

if (typeof module === "object") {
	module.exports = Tokenizer;
}
