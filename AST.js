var Node = function(type) {
	this.type = type;
	this.nodes = [];
};

Node.prototype.add = function(node) {
	this.nodes.push (node);
};

if (module) module.exports = Node;
