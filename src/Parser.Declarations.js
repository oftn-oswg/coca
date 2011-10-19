"use strict";

/* 6.9p1
 * external-declaration:
 *	 function-definition
 *	 declaration
 */
Parser.prototype.external_decl = function() {
	var token, specifiers, declarator;

	token = this.tokenizer.lookahead ();
	if (!token) return false;

	specifiers = this.declaration_specifiers ();

	/* 6.7.2.3p6: Struct, union, or enumerated type */
	token = this.tokenizer.lookahead ();
	if (token.type === Token.SEMICOLON) {
		this.tokenizer.consume ();
		// TODO: Add declaration with just `specifiers`
		return this.declaration (specifiers);
	}

	declarator = this.declarator ();
	token = this.tokenizer.lookahead ();

	switch (token.type) {
	case Token.PUNC_ASS: /* = */
	case Token.PUNC_COMMA: /* , */
	case Token.PUNC_SEMICOLON: /* ; */
		/* TODO: This is a declaration */
		return this.declaration (specifiers, declarator, token);
	default:
		/* This is a function */
		var old_style_decls = [];
		while (token.type !== Token.PUNC_CURLY_OPEN /* { */) {
			// TODO: Add declaration
			old_style_decls.push (this.declaration ());
		}
		// TODO: Add compound-statement to parse tree
		return this.function_definition (declaration_specifiers, old_style_decls);
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
			// if it's not, return
		}
	}
};


Parser.prototype.declaration = function() {
	var specifiers, token, result = [];

	specifiers = this.declaration_specifiers ();
	result.push (specifiers);

	while (true) {

		token = this.tokenizer.lookahead ();
		if (token.type === Token.PUNC_SEMICOLON) {
			this.tokenizer.consume ();
			break;
		}

		result.push (this.init_declarator_list ());
	};

	return result;
};


Parser.prototype.init_declarator = function(start) {
	var declarator, token, initializer;
	
	declarator = start || this.declarator ();
	initializer = null;

	token = this.tokenizer.lookahead ();
	if (token.type === Token.PUNC_ASS) {
		initializer = this.initializer ();
	}

	return [declarator, initializer];
};


Parser.prototype.declarator = function() {
	var token;

	token = this.tokenizer.lookahead ();
	if (token.type === Token.PUNC_ASTERISK) {
	}
};

