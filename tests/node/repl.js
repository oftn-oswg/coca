#!/usr/bin/env node

var repl = require ("repl");
var Token = require ("../../src/Token");
var Source = require ("../../src/Source");
var Tokenizer = require ("../../src/Tokenizer");
var Preprocessor = require ("../../src/Preprocessor");
var Parser = require ("../../src/Parser");
var ParserError = Parser.ParserError;

var context = repl.start (">>> ").context;
context.Token = Token;
context.Source = Source;
context.Tokenizer = Tokenizer;
context.Preprocessor = Preprocessor;
context.Parser = Parser;
context.ParserError = ParserError;
