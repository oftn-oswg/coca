The Coca C Compiler
===================

Coca is meant to be a C implementation in the JavaScript environment. Code is not interpreted, but rather compiled (or translated) into JavaScript code.


Purpose
-------

There are many uses for having a C implementation written in JavaScript. The web is quickly becoming a platform that is much more than what it used to be. Online development environments can make use of it to do syntactic validation, semantic validation, or to provide a helpful debugger. This project is designed with the goal of having understandable diagnostics that link to the C specification, a simple and understandable codebase, and a modular library-based architecture.


Roadmap
---------

* Tokenizing (~70% complete)
* Preprocessing
* Parsing
* Analysis
* Code generation