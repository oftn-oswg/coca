"use strict";

var Parser = function(tokenizer) {
	this.tokenizer = tokenizer;
};

/* 6.9p1
 * translation-unit:
 *	 external-declaration
 *	 translation-unit external-declaration
 */
Parser.prototype.parse = function() {
	while (this.external_decl());
};



var ParserError = function ParserError(self, message) {
	this.message = message;
	this.args = arguments;
};

ParserError.prototype.name = "ParserError";

ParserError.prototype.toString = function() {
	return this.name + ": " + this.message;
};

if (typeof module === "object") {
	Parser.ParserError = ParserError;
	module.exports = Parser;
}
