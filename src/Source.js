"use strict";

if (typeof require === "function") {
	// we're running under CommonJS
	var Preprocessor = require("./Preprocessor");
}

var Source = function(string, filename) {
	this.contents = string;
	this.cursor = 0;
	this.line = 1;
	this.column = 1;
	this.in_directive = Preprocessor.NO_DIRECTIVE;

	this.filename = filename || "";

	this.states = [];
};


/*
 * Gets the character code of the source at the specified index,
 * or zero if out-of-bounds.
 */
Source.prototype.ch = function(index) {
	var ch = this.contents.charCodeAt (index);
	return isNaN (ch) ? -1 : ch;
};

/* Saves the current cursor, line, and column so it can be restored later */
Source.prototype.save = function() {
	this.states.push ({
		cursor: this.cursor,
		line: this.line,
		column: this.column,
		in_directive: this.in_directive
	});
};

/* Restores the cursor, line, and column of a previously saved state */
Source.prototype.restore = function() {
	var states = this.states;
	if (!states.length) {
		throw new Error("Cannot restore, state was not saved");
	}

	var obj = states.pop ();
	this.cursor = obj.cursor;
	this.line = obj.line;
	this.column = obj.column;
	this.in_directive = obj.in_directive;
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
Source.prototype.nextch = function() {
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
		} else {
			throw new ParserError (this, "Invalid source input");
		}

	} else if (ch >= 0xDC00 && ch <= 0xDFFF) {
		throw new ParserError (this, "Invalid source input");

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
Source.prototype.peekch = function() {
	var cursor, ch;
	
	this.save ();
	ch = this.nextch ();
	this.restore ();

	return ch;
};

if (typeof module === "object") {
	module.exports = Source;
}
