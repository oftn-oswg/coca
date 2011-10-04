/* Tokenizer.js
 * ------------
 * options -> Global options
 * stream -> SourceStream to tokenize
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


var Tokenizer = function(options, stream) {
	this.options = options;
	this.stream = stream;
};

Tokenizer.punctuators = {
	"91": { value: "[" },
	"93": { value: "]" },
	"40": { value: "(" },
	"41": { value: ")" },
	"123": { value: "{" },
	"125": { value: "}" },
	"46": { value: ".",
		"46": { "46": { value: "..." }}},
	"45": { value: "-",
		"62": { value: "->" },
		"45": { value: "--" },
		"61": { value: "-=" }},
	"43": { value: "+",
		"43": { value: "++" },
		"61": { value: "+=" }},
	"38": { value: "&",
		"38": { value: "&&" },
		"61": { value: "&=" }},
	"42": { value: "*",
		"61": { value: "*=" }},
	"126": { value: "~" },
	"33": { value: "!",
		"61": { value: "!=" }},
	"47": { value: "/",
		"61": { value: "/=" }},
	"37": { value: "%",
		"61": { value: "%=" },
		"62": { value: "%>" },
		"58": { value: "%:",
			"37": { "58": { value: "%:%:" }}}},
	"60": { value: "<",
		"60": { value: "<<",
			"61": { value: "<<=" }},
		"61": { value: "<=" },
		"58": { value: "<:" },
		"37": { value: "<%" }},
	"62": { value: ">",
		"62": { value: ">>",
			"61": { value: ">>=" }},
		"61": { value: ">=" }},
	"61": { value: "=",
		"61": { value: "==" }},
	"94": { value: "^",
		"61": { value: "^=" }},
	"124": { value: "|",
		"124": { value: "||" },
		"61": { value: "|=" }},
	"63": { value: "?" },
	"58": { value: ":",
		"62": { value: ":>" }},
	"59": { value: ";" },
	"44": { value: "," },
	"35": { value: "#",
		"35": { value: "##" }}
};

/*
 * Consumes the next token from the stream,
 * and advances the stream for the next token.
 */
Tokenizer.prototype.consume = function() {
	var stream, ch;

	stream = this.stream;
	ch = stream.peekch ();

	/* end-of-file */
	if (ch === 0) return null;

	if (this.is_whitespace (ch)) {
		return this.read_whitespace ();
	}

	if (this.is_identifier_char (ch)) {
		return this.read_identifier ();
	}

	if (this.is_digit (ch)) {
		return this.read_number ();
	}

	if (ch === 39) {
		return this.read_character_constant ();
	}

	if (ch === 34) {
		return this.read_string_literal ();
	}

	// If all else fails, assume a punctuator.
	return this.read_punctuator ();
};

/*
 * Peeks the next token off the stream
 */
Tokenizer.prototype.lookahead = function() {
};


/*
 * 6.4.6p1
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
Tokenizer.prototype.read_punctuator = function() {
	var stream, ch, punc, value;

	stream = this.stream;
	ch = stream.peekch ();
	punc = Tokenizer.punctuators;
	value = null;

	while (ch = stream.peekch (), punc = punc[ch]) {
		if (punc.value) value = punc.value;
		stream.nextch ();
	}

	if (!value) {
		throw new Error("Unexpected ch " +ch);
	}
	return value;
};

Tokenizer.prototype.read_whitespace = function() {
	var stream, ch, start;

	stream = this.stream;
	start = stream.cursor;
	while (ch = stream.peekch (), this.is_whitespace (ch)) {
		stream.nextch ();
	}

	return stream.source.substring (start, stream.cursor);
};

Tokenizer.prototype.read_identifier = function() {
	var stream, ch, start;

	stream = this.stream;
	start = stream.cursor;
	while (ch = stream.peekch (), this.is_identifier_char (ch)) {
		stream.nextch ();
	}

	return stream.source.substring (start, stream.cursor);
};

/* 6.4.2.1p2
 * An identifier is a sequence of nondigit characters (including the underscore _, the
 * lowercase and uppercase Latin letters, and other characters) and digits, which designates
 * one or more entities as described in 6.2.1. Lowercase and uppercase letters are distinct.
 * There is no specific limit on the maximum length of an identifier.
 */
Tokenizer.prototype.is_identifier_char = function(ch) {
	return (ch >= 65 && ch <= 90) ||  // [A-Z]
	       (ch >= 97 && ch <= 122) || // [a-z]
	       (ch >= 48 && ch <= 57) || ch === 95; // [0-9] // _
};


Tokenizer.prototype.is_digit = function(ch) {
	return ch >= 48 && ch <= 57;
};


/* From 6.4p3
 * White-space characters:
 *     space, horizontal tab, new-line, vertical tab, and form-feed */
Tokenizer.prototype.is_whitespace = function(ch) {
	return ch === 32 || (ch >= 9 && ch <= 12);
};
