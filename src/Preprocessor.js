"use strict";

if (typeof require === "function") {
	var Token = require("./Token");
}

var Preprocessor = function(tokenizer) {
	this.tokenizer = tokenizer;

	this.macros = {
		user: {},
		special: {},
		constant: {},
	};
	this.initialize_macros ();
};

Preprocessor.NO_DIRECTIVE = 0;
Preprocessor.INCLUDE = 1 << 0;


Preprocessor.prototype.consume = function() {
	var token, column;

	column = this.tokenizer.source.column;

	for (;;) {
		if (column !== 1) { break; }
		
		token = this.tokenizer.lookahead ();
		if (token && token.type === Token.PUNC_HASH) {
			// This is a preprocessor directive
			this.handle_directive ();
		}
	}

	return this.tokenizer.consume ();

};

Preprocessor.prototype.lookahead = function() {
	var token;

	this.tokenizer.save ();
	token = this.consume ();
	this.tokenizer.restore ();

	return token;
};

/* 6.10p2
 * A preprocessing directive consists of a sequence of preprocessing tokens that satisfies the
 * following constraints: The first token in the sequence is a # preprocessing token that (at
 * the start of translation phase 4) is either the first character in the source file (optionally
 * after white space containing no new-line characters) or that follows white space
 * containing at least one new-line character. The last token in the sequence is the first new-
 * line character that follows the first token in the sequence. A new-line character ends
 * the preprocessing directive even if it occurs within what would otherwise be an
 * invocation of a function-like macro.
 */
Preprocessor.prototype.handle_directive = function() {
	var token;

	token = this.tokenizer.consume ();
	token.must_be (this, Token.PUNC_HASH);

	this.skip_line_whitespace ();

	token = this.tokenizer.lookahead ();
	token.must_be (this, Token.IDENTIFIER);
	
	switch (token.value) {
	case "define": this.handle_define (); break;
	default: throw new ParserError (this, "Unknown directive", token.value);
	}

	token = this.tokenizer.consume ();
	token.must_be (this, Token.WHITESPACE, 10);
};


Preprocessor.prototype.handle_define = function() {
	var token, macro_name, macro_tokens = [];

	token = this.tokenizer.consume ();
	token.must_be (this, Token.IDENTIFIER, "define");

	this.skip_line_whitespace ();

	token = this.tokenizer.consume ();
	token.must_be (this, Token.IDENTIFIER);
	macro_name = token.value;

	this.skip_line_whitespace ();

	while (token = this.tokenizer.lookahead()) {
		if (token.type === Token.WHITESPACE && token.value === 10) break;

		macro_tokens.push (this.tokenizer.consume ());
	}

	this.macros.user[macro_name] = macro_tokens;
};

/* 6.10p5
 * The only white-space characters that shall appear between preprocessing tokens within a
 * preprocessing directive (from just after the introducing # preprocessing token through
 * just before the terminating new-line character) are space and horizontal-tab (including
 * spaces that have replaced comments or possibly other white-space characters in
 * translation phase 3).
 */
Preprocessor.prototype.skip_line_whitespace = function() {
	var token;
	while (token = this.tokenizer.lookahead (), token.type === Token.WHITESPACE) {
		if (token.value !== 32 && token.value !== 9) break;
		this.tokenizer.consume ();
	}
};


Preprocessor.prototype.next_non_whitespace_token = function() {
	var token;

	for (;;) {
		token = this.tokenizer.consume ();
		if (token === null || token.type !== Token.WHITESPACE) {
			return token;
		}
	}
};


Preprocessor.prototype.initialize_macros = function() {
	var constants, months, date_obj, month, year, date, hour, mins, secs;
	
	constants = this.macros.constant;

	date_obj = new Date;
	month = date_obj.getMonth ();
	year = date_obj.getFullYear ();
	date = date_obj.getDate ();
	hour = date_obj.getHours ();
	mins = date_obj.getMinutes ();
	secs = date_obj.getSeconds ();

	constants["__DATE__"] = [
		new Token (Token.STRING_LITERAL,
			["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month] +
			" " + (date < 10 ? " " + date : date) + " " + year, false)];

	constants["__TIME__"] = [
		new Token (Token.STRING_LITERAL,
			(hour < 10 ? "0" + hour : hour) + ":" +
			(mins < 10 ? "0" + mins : mins) + ":" +
			(secs < 10 ? "0" + secs : secs), false)];

	constants["__STDC__"] = []; // Integer constant 1
	constants["__STDC_HOSTED__"] = []; // Integer constant 1
	constants["__STDC_MB_MIGHT_NEQ_WC__"] = []; // Integer constant 1
	constants["__STDC_VERSION__"] = []; // Integer constant 199901L
	constants["__STDC_IEC_559__"] = []; // Integer constant 1
	constants["__STDC_IEC_559_COMPLEX__"] = []; // Integer constant 1
	constants["__STDC_ISO_10646__"] = []; // TODO: Figure out what the hell this should be set to
};

if (typeof module === "object") {
	module.exports = Preprocessor;
}
