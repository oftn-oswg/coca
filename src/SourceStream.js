"use strict";

/* SourceStream
 * ------------
 * The SourceStream object implements the first two phases of translation.
 * It supplies methods for accessing a stream of characters from the source file.
 *
 * options -> Options object containing global information
 * string  -> Source code to stream from
 */

/*
 * 5.1.1.2 Translation Phases:
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

var SourceStream = function(options, string) {
	this.options = options;
	this.source = string;
	this.cursor = 0;
	this.line = 1;
	this.column = 1;
};

/*
 * Gets the character code of the source at the specified index,
 * or zero if out-of-bounds.
 *
 * TODO: Pair unicode surrogate pairs
 */
SourceStream.prototype.ch = function(index) {
	return this.source.charCodeAt (index) | 0;
};

/*
 * Gets the character code of the source at the current cursor
 * and increments the cursor.
 *
 * TODO: Support trigraph sequences as an option
 */
SourceStream.prototype.nextch = function() {
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
SourceStream.prototype.peekch = function() {
	var cursor, ch;
	
	cursor = this.cursor;
	ch = this.nextch ();
	this.cursor = cursor;

	return ch;
};

if (typeof module !== "undefined") {
	module.exports = SourceStream;
}
