#!/usr/bin/env node

"use strict";

var SourceStream = require ("../src/SourceStream.js");
var Tokenizer = require ("../src/Tokenizer");
var Token = Tokenizer.Token;

var repl = require ("repl");
var context = repl.start ().context;

context.SourceStream = SourceStream;
context.Tokenizer = Tokenizer;
context.Token = Token;
