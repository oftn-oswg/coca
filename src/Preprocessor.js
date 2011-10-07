"use strict";

var Preprocessor = function(tokenizer) {
	this.tokenizer = tokenizer;
};

Preprocessor.NO_DIRECTIVE = 0;
Preprocessor.INCLUDE = 1 << 0;


Preprocessor.prototype.consume = function() {
	var token;

	for (;;) {
		token = this.tokenizer.consume ();
		if (!token || token.type !== Token.WHITESPACE)
			return token;
	}
};

Preprocessor.prototype.lookahead = function() {
	var token;

	this.tokenizer.save ();
	token = this.consume ();
	this.tokenizer.restore ();

	return token;
};
