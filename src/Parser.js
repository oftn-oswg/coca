
var ParserError = function ParserError(self, message) {
	this.message = message;
	this.args = arguments;
};

ParserError.prototype.name = "ParserError";

ParserError.prototype.toString = function() {
	return this.name + ": " + this.message;
};

