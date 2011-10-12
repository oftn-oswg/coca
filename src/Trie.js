"use strict";

var Trie = function() {};

Trie.prototype.add = function(string, value) {
	var object, character, index;

	index = 0;
	object = this;
	string = String(string);

	while (index < string.length) {
		character = string.charCodeAt (index++);
		object = object[character] || (object[character] = new Trie());
	}

	object.value = value;
};

if (typeof module === "object") {
	module.exports = Trie;
}
