"use strict";

/*
 * Copyright © 2011 by The OF:Ø Foundation
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* Tokenizer
 * ---------
 * options -> Global options
 * string  -> Source code to stream from
 *
 * 5.1.1.2 Translation Phases
 *
 *   1. Physical source file multibyte characters are mapped, in an implementation-
 *      defined manner, to the source character set (introducing new-line characters for
 *      end-of-line indicators) if necessary. Trigraph sequences are replaced by
 *      corresponding single-character internal representations.
 *
 *   2. Each instance of a backslash character (\) immediately followed by a new-line
 *      character is deleted, splicing physical source lines to form logical source lines.
 *      Only the last backslash on any physical source line shall be eligible for being part
 *      of such a splice. A source file that is not empty shall end in a new-line character,
 *      which shall not be immediately preceded by a backslash character before any such
 *      splicing takes place.
 *
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


var Tokenizer = function(options, string) {
	this.options = options;
	this.source = string;
	this.cursor = 0;
	this.line = 1;
	this.column = 1;
};


Tokenizer.prototype.is_identifier_char = function(ch) { return (ch >= 65 && ch <= 90) ||            /* [A-Z] */
                                                               (ch >= 97 && ch <= 122) ||           /* [a-z] */
                                                               (ch >= 48 && ch <= 57) || ch === 95; /* [0-9_] */};

Tokenizer.prototype.is_digit           = function(ch) { return ch >= 48 && ch <= 57; /* [0-9] */ };

Tokenizer.prototype.is_whitespace      = function(ch) { return ch === 32 || (ch >= 9 && ch <= 12); };

/*
 * Gets the character code of the source at the specified index,
 * or zero if out-of-bounds.
 *
 * TODO: Pair unicode surrogate pairs
 */
Tokenizer.prototype.ch = function(index) {
	return this.source.charCodeAt (index) | 0;
};

/*
 * Gets the character code of the source at the current cursor
 * and increments the cursor.
 *
 * TODO: Support trigraph sequences as an option
 */
Tokenizer.prototype.nextch = function() {
	var ch, cursor = this.cursor;

	ch = this.ch (cursor) | 0;
	cursor++;

	if (ch === 92) { /* backslash */
		if (this.ch (cursor) === 10) {
			/* backslash followed by newline */
			ch = this.ch (cursor + 1) | 0;
			cursor += 2;
		}
	}

	this.cursor = cursor;

	return ch;
};

/*
 * Gets the character code of the source at the current cursor,
 * but does not increment the cursor.
 */
Tokenizer.prototype.peekch = function() {
	var cursor, ch;
	
	cursor = this.cursor;
	ch = this.nextch ();
	this.cursor = cursor;

	return ch;
};


/*
 * Consumes the next token from the stream,
 * and advances the stream for the next token.
 */
Tokenizer.prototype.consume = function() {
	var ch = this.peekch ();

	if (this.is_whitespace (ch))      return new Token (Token.WHITESPACE, ch);
	if (this.is_digit (ch))           return this.read_number ();
	if (this.is_identifier_char (ch)) return this.read_identifier ();
	if (ch === 34) /* double-quote */ return this.read_string_literal ();
	if (ch === 39) /* single-quote */ return this.read_character_constant ();
	if (ch === 0)  /* end-of-file  */ return null;

	// If all else fails, assume a punctuator.
	return this.read_punctuator ();
};

/*
 * Peeks the next token off the stream
 */
Tokenizer.prototype.lookahead = function() {
};


Tokenizer.prototype.read_punctuator = function() {
	var ch, punc, value;

	punc = Token.punctuators;
	value = null;

	while (ch = this.peekch (), punc = punc[ch]) {
		if (punc.value) value = punc.value;
		this.nextch ();
	}

	if (!value) {
		throw new Error("Unexpected ch " +ch);
	}
	return value;
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

	while (ch = this.peekch (), this.is_identifier_char (ch)) {
		characters.push (this.nextch ());
	}

	name = String.fromCharCode.apply (null, characters);
	return Token.keywords[name] || new Token (Token.IDENTIFIER, name);
};


var Token = function(type, value) {
	this.type = type;
	this.value = value;
};

/* Token types */
Token.KEYWORD    = 1 << 0;
Token.IDENTIFIER = 1 << 1;
Token.WHITESPACE = 1 << 2;
Token.PUNCTUATOR = 1 << 3;

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
	Tokenizer.Token = Token;
	module.exports = Tokenizer;
}
