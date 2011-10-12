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


/* 6.9p1
 * external-declaration:
 *	 function-definition
 *	 declaration
 */
Parser.prototype.external_decl = function() {
	var token;

	token = this.tokenizer.lookahead ();
	if (!token) return false;

	this.declaration_specifiers ();

	/* 6.7.2.3p6: Struct, union, or enumerated type */
	token = this.tokenizer.lookahead ();
	if (token.type === Token.SEMICOLON) {
		this.tokenizer.consume ();
		// TODO: Handle struct, union, or enumerated type */
	}


};



/* 6.7p1
 * declaration-specifiers:
 *	 storage-class-specifier declaration-specifiers(opt)
 *	 type-specifier declaration-specifiers(opt)
 *	 type-qualifier declaration-specifiers(opt)
 *	 function-specifier declaration-specifiers(opt)
 */
Parser.prototype.declaration_specifiers = function() {
	var token, storage, type_spec, type_qual, inline;
	
	storage = [];
	type_spec = [];
	type_qual = [];
	inline = false;
	
	/* (storage-class-specifier | type-specifier | type-qualifier | function-specifier)+ */
	
	while (token = this.tokenizer.lookahead()) {
		switch (token.type) {
			
		/* storage-class-specifiers */
		case Token.KEYWORD_typedef:
		case Token.KEYWORD_extern:
		case Token.KEYWORD_static:
		case Token.KEYWORD_auto:
		case Token.KEYWORD_register:
			storage.push (this.tokenizer.consume ());
			break;
		
		/* type-specifiers */
		case Token.KEYWORD_struct:
		case Token.KEYWORD_union:
			type_spec.push (this.struct_or_union_specifier ());
			break;
		case Token.KEYWORD_enum:
			type_spec.push (this.enum_specifier ());
			break;
		case Token.KEYWORD_void:
		case Token.KEYWORD_short:
		case Token.KEYWORD_int:
		case Token.KEYWORD_long:
		case Token.KEYWORD_float:
		case Token.KEYWORD_double:
		case Token.KEYWORD_signed:
		case Token.KEYWORD_unsigned:
		case Token.KEYWORD__Bool:
		case Token.KEYWORD__Complex:
			type_spec.push (this.tokenizer.consume ());
			break;
		
		/* type-qualifiers */
		case Token.KEYWORD_const:
		case Token.KEYWORD_restrict:
		case Token.KEYWORD_volatile:
			type_qual.push (this.tokenizer.consume ());
			break;
		
		case Token.KEYWORD_inline:
			inline = true;
			break;
		
		default:
			// check if token is a typedef identifier,
			// if it is, it's a type-specifier
		}
	}
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
