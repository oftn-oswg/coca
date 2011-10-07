"use strict";

var Preprocessor = function(tokenizer) {
	this.tokenizer = tokenizer;

	this.macros = {};
	this.initialize_macros ();
};

Preprocessor.NO_DIRECTIVE = 0;
Preprocessor.INCLUDE = 1 << 0;


Preprocessor.prototype.consume = function() {
	var token, column;

	column = this.tokenizer.source.column;

	if (column === 1) {
		token = this.tokenizer.lookahead ();
		if (token === Token.PUNC_HASH) {
			// This is a preprocessor directive
			this.handle_directive ();
		}
	}

	return this.next_non_whitespace_token ();

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
	token.must_be (Token.PUNC_HASH);

	this.skip_whitespace ();

	token = this.tokenizer.lookahead ();
	token.must_be (Token.IDENTIFIER);
	
	switch (token.value) {
	case "define":
		this.handle_define ();
	default:
		throw new ParserError (this, "Unknown directive", token.value);
	}
};


Preprocessor.prototype.handle_define = function() {
	var token;
	
	token = this.tokenizer.consume ();
	token.must_be (Token.IDENTIFIER, "define");

	this.skip_whitespace ();

	token = this.tokenizer.consume ();
	token.must_be (Token.IDENTIFIER);

};

/* 6.10p5
 * The only white-space characters that shall appear between preprocessing tokens within a
 * preprocessing directive (from just after the introducing # preprocessing token through
 * just before the terminating new-line character) are space and horizontal-tab (including
 * spaces that have replaced comments or possibly other white-space characters in
 * translation phase 3).
 */
Preprocessor.prototype.skip_whitespace = function() {
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
	this.date = new Date();

	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var month = date.getMonth ();
	var year = date.getFullYear ();
	var date = date.getDate ();
	var hour = date.getHours ();
	var secs = date.getSeconds ();

	// TODO: These are constant and cannot be changed, except for __FILE__ and  __LINE__

	this.macros["__DATE__"] = [
		new Token (Token.STRING_LITERAL,
			months[month] + " " + (date < 10 ? " " + date : date) + " " + year)];

	this.macros["__FILE__"] = [
		new Token (Token.STRING_LITERAL,
			this.tokenizer.source.filename)];

	this.macros["__LINE__"] = [/* TODO: Create integer constant token */]; // this.tokenizer.source.line

	this.macros["__STDC__"] = []; // Integer constant 1

	this.macros["__STDC_HOSTED__"] = []; // Integer constant 1

	this.macros["__STDC_MB_MIGHT_NEQ_WC__"] = []; // Integer constant 1

	this.macros["__STDC_VERSION__"] = []; // Integer constant 199901L

	this.macros["__TIME__"] = [
		new Token (Token.STRING_LITERAL,
			(hour < 10 ? "0" + hour : hour) + ":" +
			(mins < 10 ? "0" + mins : mins) + ":" +
			(secs < 10 ? "0" + secs : secs))];

	this.macros["__STDC_IEC_559__"] = []; // Integer constant 1

	this.macros["__STDC_IEC_559_COMPLEX__"] = []; // Integer constant 1

	this.macros["__STDC_ISO_10646__"] = []; // Figure out what the hell this is set to


};
