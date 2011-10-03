var Node = require("./Node.js");

var Parser = function (source) {
	this.source = String(source);
	this.pos = {cursor: 0, line: 1, column: 1};
};


Parser.hashify = function(array) {
	var o = {}, len = array.length;

	while (len--) {
		o[array[len]] = true;
	}

	return o;
};


Parser.keywords = Parser.hashify (["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","inline","int","long","register","restrict","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","_Bool","_Complex","_Imaginary"]);


Parser.punctuators = Parser.hashify (["[","]","(",")","{","}",".","->","++","--","&","*","+","-","~","!","/","%","<<",">>","<",">","<=",">=","==","!=","^","|","&&","||","?",":",";","...","=","*=","/=","%=","+=","-=","<<=",">>=","&=","^=","|=",",","#","##","<:",":>","<%","%>","%:","%:%:"]);


Parser.prototype.peek_ch = function () {
	var code = this.source.charCodeAt (this.pos.cursor);
	return code;
};


Parser.prototype.next_ch = function (signal_eof) {
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


Parser.prototype.is_whitespace = function (code) {
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


Parser.prototype.is_identifier_nondigit = function(code) {
	if (code === 95) return true; // '_' character
	if ((code >= 65 && code <= 90) ||
		(code >= 97 && code <= 122)) return true; // [a-zA-Z]
	return false;
};


Parser.prototype.is_identifier_digit = function(code) {
	if (code >= 48 && code <= 57) return true; // [0-9]
	return false;
}


Parser.prototype.skip_whitespace = function () {
	while (this.is_whitespace (this.peek_ch ())) {
		this.next_ch ();
	}
};


Parser.prototype.lex_identifier = function() {
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


Parser.prototype.consume = function() {
	var code, name, token, line, column;
	
	this.skip_whitespace ();
	
	line = this.pos.line;
	column = this.pos.column;
	
	code = this.peek_ch ();
	
	if (isNaN (code)) return null;
	
	if (this.is_identifier_nondigit (code)) {
		return this.lex_identifier ();
	}

	throw "Unexpected "+String.fromCharCode(code);
	
};


Parser.prototype.ExternalDeclaration = function() {
	var node;

	node = new Node("external-declaration");
	
	for (;;)
};


Parser.prototype.TranslationUnit = function() {
	var node, child;
	
	node = new Node("translation-unit");

	while (true) {

		child = this.ExternalDeclaration ();

		if (node) {
			node.add (child);
		} else {
			break;
		}
	}

	return node;
};


if (module) module.exports = Parser;

var parser = new Parser ("#include <stdio.h>\nint main(int argc, char *argv[]) { while (argc--) puts (argv[argc]); }");

console.log (parser.TranslationUnit());
