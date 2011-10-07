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


var Tokenizer = function(options, string) {
	this.options = options;
	this.source = string;
	this.cursor = 0;
	this.line = 1;
	this.column = 1;

	this.states = [];
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
 * Gets the character code of the source at the specified index,
 * or zero if out-of-bounds.
 */
Tokenizer.prototype.ch = function(index) {
	return this.source.charCodeAt (index) | 0;
};

/* Saves the current cursor, line, and column so it can be restored later */
/* FIXME: I hate these functions. */
Tokenizer.prototype.save = function() {
	this.states.push ({
		cursor: this.cursor,
		line: this.line,
		column: this.column
	});
};

/* Restores the cursor, line, and column of a previously saved state */
/* FIXME: Skewer me with a rake. */
Tokenizer.prototype.restore = function() {
	var states = this.states;
	if (!states.length) {
		throw new Error("Cannot restore, state was not saved");
	}

	var obj = states.pop ();
	this.cursor = obj.cursor;
	this.line = obj.line;
	this.column = obj.column;
};

/*
 * Gets the character code of the source at the current cursor
 * and increments the cursor.
 *
 * TODO: Support trigraph sequences as an option
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
 */
Tokenizer.prototype.nextch = function() {
	var ch;

	ch = this.ch (this.cursor);
	this.cursor++;
	this.column++;

	if (ch >= 0xD800 && ch <= 0xDBFF) {
		/* UTF-16 surrogate pair */
		var lo = this.ch (this.cursor);
		if (lo >= 0xDC00 && lo <= 0xDFFF) {
			ch = ((ch - 0xD800) << 10) + (lo - 0xDC00) + 0x10000;
			this.cursor++;
			this.column++;
		} else {
			this.error ("Invalid surrogates in input");
		}
	} else switch (ch) {
	case 92:
		/* backslash */
		switch (this.ch (this.cursor)) {
		case 10:
			/* backslash and newline; skip */
			this.cursor++;
			this.line++;
			this.column = 1;
			ch = this.nextch ();
			break;
		}
		break;
	case 10:
		/* newline */
		this.line++;
		this.column = 1;
		break;
	}

	return ch;
};

/*
 * Gets the character code of the source at the current cursor,
 * but does not increment the cursor.
 */
Tokenizer.prototype.peekch = function() {
	var cursor, ch;
	
	this.save ();
	ch = this.nextch ();
	this.restore ();

	return ch;
};


/*
 * Consumes the next token from the stream,
 * and advances the stream for the next token.
 */
Tokenizer.prototype.consume = function() {
	var ch = this.peekch ();

	if (this.is_whitespace (ch))      return new Token (Token.WHITESPACE, this.nextch ());
	if (this.is_digit (ch))           return this.read_number ();
	if (this.is_identifier_char (ch)) return this.read_identifier ();
	if (ch === 34) /* double-quote */ return this.read_string_literal ();
	if (ch === 39) /* single-quote */ return this.read_character_constant ();
	if (ch === 0)  /* end-of-file  */ return null;

	if (ch === 47) /* forward slash */ {
		this.save (); /* FIXME: I hate this. */
		this.nextch ();
		switch (this.nextch ()) {
		case 47: return this.read_bcpl_comment ();
		case 42: return this.read_block_comment ();
		}
		this.restore ();
	}

	// If all else fails, assume a punctuator.
	return this.read_punctuator ();
};

/*
 * Peeks the next token off the stream
 */
Tokenizer.prototype.lookahead = function() {
	var token;

	this.save ();
	token = this.consume ();
	this.restore ();

	return token;
};

Tokenizer.prototype.read_escape_sequence = function() {
	var ch, code = 0, max;

	ch = this.nextch ();
	switch (ch) {
	case 34: case 39: case 63: case 92: return ch; // Quotes, question mark, backslash
	case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: /* Octals */
		max = 3;
		while (max--) {
			code = code << 3 | (ch - 48);
			if (!this.is_octal_digit (this.peekch ())) break;
			ch = this.nextch ();
		}
		return code;
	case 85: case 117:
		/* \U, \u: Universal character names */
		var required = (ch === 85) ? 8 : 4, i = required;
		while (i--) {
			ch = this.nextch ();
			if (!this.is_hexadecimal_digit (ch)) {
				this.error ("Universal character name requires " + required + " hexadecimal digits");
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
		while (ch = this.peekch (), this.is_hexadecimal_digit (ch)) {
			code = code << 4 | ch - ((ch >= 48 && ch <= 57) ? 48 : (ch >= 65 && ch <= 70) ? 55 : 87);
			this.nextch ();
		}
		return code;
	default:
		this.error ("Unknown escape sequence");
	}
};


Tokenizer.prototype.read_string_literal = function(wide) {
	var characters, ch;

	this.nextch (); // Skip the starting quote
	characters = [];
	wide = wide || false;

	loop:
	while (ch = this.peekch ()) {
		switch (ch) {
		case 0: this.error ("Unterminated string literal"); break;
		case 34:
			this.nextch ();
			break loop;
		case 92:
			this.nextch ();
			characters.push (this.read_escape_sequence ());
			break;
		default:
			characters.push (this.nextch ());
		}
	}

	return new Token (Token.STRING_LITERAL, this.codes_to_string (characters), wide);
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

	name = this.codes_to_string (characters);
	return Token.keywords[name] || new Token (Token.IDENTIFIER, name);
};

/* 6.4.9p2
 * Except within a character constant, a string literal, or a comment, the characters //
 * introduce a comment that includes all multibyte characters up to, but not including, the
 * next new-line character. The contents of such a comment are examined only to identify
 * multibyte characters and to find the terminating new-line character.
 */
Tokenizer.prototype.read_bcpl_comment = function() {
	var ch;

	while (ch = this.peekch (), ch !== 10 && ch !== 0)
		/* while ch is not a newline */
		this.nextch ();

	return new Token (Token.WHITESPACE, 32); // 5.1.1.2p3 "Each comment is replaced by one space character."
};

// 6.4.9p1
// Except within a character constant, a string literal, or a comment, the characters /*
// introduce a comment. The contents of such a comment are examined only to identify
// multibyte characters and to find the characters */ that terminate it.71)

Tokenizer.prototype.read_block_comment = function() {
	var ch, slash, term = false;

	loop:
	while (ch = this.peekch ()) {
		switch (ch) {
		case 0: this.error ("Unterminated comment");
		case 47: if (term) { this.nextch (); break loop; }
		case 42: term = true; break;
		default: term = false; break;
		}
		this.nextch ();
	}

	return new Token (Token.WHITESPACE, 32); // 5.1.1.2p3
};

Tokenizer.prototype.codes_to_string = function(code_array) {
	return String.fromCharCode.apply (null, code_array);
};

Tokenizer.prototype.error = function(message) {
	message = message + " on line " + this.line + ", col " + this.column;
	throw new Error (message);
};

Tokenizer.prototype.iterate = function() {
	var array = [], token;
	while (token = this.consume ()) {
		array.push (token);
	}
	return array;
};


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
	Tokenizer.Token = Token;
	module.exports = Tokenizer;
}
