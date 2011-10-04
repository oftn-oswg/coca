var Token = function(type, a1) {
	this.type = type;

	switch (type) {
	case Token.IDENTIFIER:
		this.name = String(a1);
	}
};

Token.IDENTIFIER = 1;

var Tokenizer = function(source) {
	this.source = source;
	this.pos = 0;
};

Tokenizer.SyntaxError = function(msg) { this.message = msg; };
Tokenizer.SyntaxError.prototype.name = "SyntaxError";

Tokenizer.prototype.next = function(error_on_eof) {
	var ch;

	ch = this.source.charCodeAt(this.pos++);

	if (error_on_eof && isNaN (ch)) {
		throw new Tokenizer.SyntaxError (error_on_eof);
	}
	return ch;
};

Tokenizer.prototype.peek = function() {
	return this.source.charCodeAt (this.pos);
};

Tokenizer.prototype.is_idenfitier_char = function(ch) {
	/* 6.4.2.1p2
	 * An identifier is a sequence of nondigit characters (including the underscore _, the
	 * lowercase and uppercase Latin letters, and other characters) and digits, which designates
	 * one or more entities as described in 6.2.1. Lowercase and uppercase letters are distinct.
	 * There is no specific limit on the maximum length of an identifier.
	 */

	return (ch >= 65 && ch <= 90) ||  // [A-Z]
	       (ch >= 97 && ch <= 122) || // [a-z]
	       (ch >= 48 && ch <= 57) || ch === 95; // [0-9] // _
};

Tokenizer.prototype.is_alpha = function(ch) {
	return (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122);
};


Tokenizer.prototype.is_digit = function(ch) {
	return ch >= 48 && ch <= 57;
};

Tokenizer.prototype.is_hexadecimal_digit = function(ch) {
	return (ch >= 48 && ch <= 57) || (ch >= 97 && ch <= 102) || (ch >= 65 && ch <= 70);
};

Tokenizer.prototype.lex_identifier = function() {
	var ch, start = this.pos, length = 0;

	while (ch = this.peek(), this.is_identifier_char(ch)) {
		this.next ();
		length++;
	}

	return new Token(Token.IDENTIFIER, this.source.substring (start, start+length));
};

Tokenizer.prototype.scan_digit_sequence = function(radix) {
	var length;

	length = 0;
	for (;;) {
		switch (radix) {
		case 16:
			while (ch = this.peek(), this.is_hexadecimal_digit (ch)) {
				this.next ();
				length++;
			}
			break;
		case 10:
		case 8:
			while (ch = this.peek(), this.is_digit (ch)) {
				if (radix === 8 && (ch === 56 || ch === 57)) {
					throw new Tokenizer.SyntaxError ("Invalid digit "+(ch-48)+" in octal literal");
				}
				this.next ();
				length++;
			}
			break;
		}
	}

	return length;
};

Tokenizer.prototype.lex_number = function() {
	var ch, start = this.pos, length = 0, radix;
	var is_unsigned, is_long, is_long_long, is_floating, is_float;

	is_unsigned = false;
	is_long = false;
	is_long_long = false;
	is_floating = false;
	is_float = false;
	
	radix = 10;
	ch = this.peek();

	/* Get the type of number */
	if (ch === 48) /* "0" */ {
		/* Number is an octal constant or hexadecimal constant */
		radix = 8;
		this.next ();
		length++;

		ch = this.peek ();
		if (ch === 88 || ch === 120) /* x, X */ {
			radix = 16;
			this.next ();
			length++;
		}
	}

	length += this.scan_digit_sequence (radix);

	ch = this.peek();
	if (ch === 46) { /* . */
		is_floating = true;
		length += this.scan_digit_sequence (radix);
	}

	ch = this.peek();
	if (ch === 101 || ch === 69 || ch === 112 || ch === 80) /* e, E, p, P */ {
		this.next ();
		length++;
		/* First check for a sign */
		ch = this.peek ();
		if (ch === 43 || ch === 45) {
			this.next ();
			length++;
		}

		var exponent_length = this.scan_digit_sequence (10);
		if (exponent_length) {
			is_floating = true;
			length += exponent_length;
		} else {
			this.error ("Exponent has no digits");
		}
	}

	/* Number suffix */
	scan_suffix:
	while (ch = this.peek(), this.is_alpha (ch)) {
		this.next ();

		switch (ch) {
		case 177: case 85: /* U, u */
			if (!is_unsigned) {
				is_unsigned = true;
				continue scan_suffix;
			}
			break;
		case 108: case 76: /* L, l */
			if (!is_long) {
				is_long = true;
				continue scan_suffix;
			} else if (!is_long_long) {
				is_long_long = true;
				continue scan_suffix;
			}
		}
		
		this.error ("Invalid suffix on integer constant");
	}

};

Tokenizer.prototype.consume = function() {
	var ch;

	ch = this.peek ();
	switch (ch) {
	default:
		if (this.is_digit (ch)) {
			return this.lex_number();
		}
		if (this.is_identifier_start (ch)) {
			return this.lex_identifier();
		}
	}
	return null;
};

/*
var Parser = function() {
};

Parser.prototype.translation_unit = function() {
	var token, ast;

	ast = ["translation-unit"];
	token = this.tokenizer.lookahead ();

	if (token.type === Token.EOF) {
		this.warn ("ISO C forbids an empty translation unit");
	} else {
		do {
			ast.push (this.exteral_declaration ());

		} while (token = this.tokenizer.lookahead (),
		         token.type !== Token.EOF);

	}

	return ast;
};

Parser.prototype.external_declaration = function() {
	var ext, ast, token;

	ast = ["external-declaration"];
	token = this.tokenizer.lookahead ();

	switch (token.type) {
	case Token.SEMICOLON:
		
	}
};

//*/
