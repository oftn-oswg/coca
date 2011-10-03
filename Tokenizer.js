var Node = require("./Node.js");

var Tokenizer = function (source) {
	this.source = String(source);
	this.pos = {cursor: 0, line: 1, column: 1};
};


Tokenizer.hashify = function(array) {
	var o = {}, len = array.length;

	while (len--) {
		o[array[len]] = true;
	}

	return o;
};


Tokenizer.keywords = Tokenizer.hashify (["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","inline","int","long","register","restrict","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","_Bool","_Complex","_Imaginary"]);


Tokenizer.punctuators = Tokenizer.hashify (["[","]","(",")","{","}",".","->","++","--","&","*","+","-","~","!","/","%","<<",">>","<",">","<=",">=","==","!=","^","|","&&","||","?",":",";","...","=","*=","/=","%=","+=","-=","<<=",">>=","&=","^=","|=",",","#","##","<:",":>","<%","%>","%:","%:%:"]);


Tokenizer.prototype.peek_ch = function () {
	var code = this.source.charCodeAt (this.pos.cursor);
	return code;
};


Tokenizer.prototype.next_ch = function (signal_eof) {
	var code = this.source.charCodeAt (this.pos.cursor++);
	if (signal_eof && isNaN (code))
		throw new SyntaxError("Unexpected end of input");
	
	if (code == 10) {
		this.pos.line++;
		this.pos.column = 1;
	} else {
		this.pos.column++;
	}
	return code;
};


Tokenizer.prototype.is_whitespace = function (code) {
	switch (code) {
		case 9: // Horizontal tab
		case 10: // Newline
		case 11: // Vertical tab
		case 12: // Form feed
		case 32:  // Space character
			return true;
	}
	return false;
};


Tokenizer.prototype.is_identifier_nondigit = function(code) {
	if (code === 95) return true; // '_' character
	if ((code >= 65 && code <= 90) ||
		(code >= 97 && code <= 122)) return true; // [a-zA-Z]
	return false;
};


Tokenizer.prototype.is_identifier_digit = function(code) {
	if (code >= 48 && code <= 57) return true; // [0-9]
	return false;
}


Tokenizer.prototype.skip_whitespace = function () {
	while (this.is_whitespace (this.peek_ch ())) {
		this.next_ch ();
	}
};


Tokenizer.prototype.lex_identifier = function() {
	var ret = [], code;

	while (true) {
		code = this.peek_ch ();

		if (isNaN (code)) break;
		
		if (this.is_identifier_nondigit (code) ||
			this.is_identifier_digit (code)) {

			ret.push (this.next_ch ());
			continue;
		}

		break;
	}

	return String.fromCharCode.apply (null, ret);
};


Tokenizer.prototype.handle_directive = function() {
	var code;

	while (this.peek_ch () !== 10) {
		this.next_ch ();
	}
};


Tokenizer.prototype.consume = function() {
	var code, name, token, line, column;
	
	this.skip_whitespace ();
	
	line = this.pos.line;
	column = this.pos.column;
	
	code = this.peek_ch ();
	
	if (isNaN (code)) return null;

	if (code === 35 && column === 1) {
		this.handle_directive ();
	}
	
	if (this.is_identifier_nondigit (code)) {
		return this.lex_identifier ();
	}

	throw "Unexpected "+String.fromCharCode(code);
	
};


if (module) module.exports = Tokenizer;

var parser = new Tokenizer ("#include <stdio.h>\nint main(int argc, char *argv[]) { while (argc--) puts (argv[argc]); }");

console.log (parser.TranslationUnit());
