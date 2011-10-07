#!/usr/bin/env node

"use strict";

var Tokenizer = require ("../src/Tokenizer");
var Token = Tokenizer.Token;

var repl = require ("repl");
var context = repl.start ().context;

context.Tokenizer = Tokenizer;
context.Token = Token;
