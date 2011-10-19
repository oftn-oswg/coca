"use strict";

var AST = {
	Declaration: function(specifiers, declaration_list) {
		this.specifiers = specifiers;
		this.declaration_list = declaration_list;
	},
	FunctionDefinition: function(specifiers, declarator, declaration_list, compound_statement) {
		this.specifiers = specifiers;
		this.declarator = declarator;
		this.declaration_list = declaration_list;
		this.compound_statement = compound_statement;
	}
};

AST.TranslationUnit = function() { this.declarations = []; };
AST.TranslationUnit.prototype.add_declaration = function(declaration) {
	this.declarations.push (declaration);
};
