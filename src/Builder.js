/**
 * @fileoverview An API for building JavaScript
 * @author Thomas Allen <thomasmallen@gmail.com>
 */
;(function() {
    /**
     * Usage:
     *     var s = new Coca.Builder.Group(),
     *         fn = s.addFunction('doSomething', ['a', 'b', 'c']);
     *     fn.addVariables([['a'], ['b', new Coca.Builder.Function('hello')]])
     *     fn.endStatement();
     *     fn.addIf('x < 2').addElse().withIf('y > 1');
     *     print(s);
     *     -> (function doSomething(a, b, c) {var a, b = function hello() {};if (x < 2) {}else if (y > 1) {}})
     */
    Coca.Builder = {
        /**
         * Base source builder.
         *
         * Does not perform validation; it is the responsibility of the user
         * to ensure that the API is used to create valid JavaScript code.
         */
        Source: function() {
            this.bits = [];
        },

        addType: function(type, fn, toString, ps) {
            var P = Coca.Builder.Source,
                C = function() {
                    P.apply(this);
                    if (fn)
                        if (typeof fn != 'function') {
                            this.push(fn);
                            this.endStatement();
                        } else fn.apply(this, arguments);
                };
            C.prototype = new P();
            C.prototype.toString = function() {
                var s = P.prototype.toString.apply(this);
                if (toString)
                    s = toString.call(this, s);
                return s;
            };
            if (ps)
                for (var p in ps)
                    if (ps.hasOwnProperty(p))
                        C.prototype[p] = ps[p];
            Coca.Builder[type] = C;
            P.prototype['add' + type] = function() {
                var o = new C();
                C.apply(o, arguments);
                return this.push(o);
            };
        }
    };

    Coca.Builder.Source.prototype.push = function(p) {
        this.bits.push(p);
        return p;
    };
    Coca.Builder.Source.prototype.toString = function() {
        return this.bits.join('');
    };
    Coca.Builder.Source.prototype.endStatement = function() {
        return this.push(';');
    };

    // Simple types
    Coca.Builder.addType('Empty', '');
    Coca.Builder.addType('Continue', 'continue');
    Coca.Builder.addType('Break', 'break');

    Coca.Builder.addType('Comment', function(c) {
        this.push('/* ' + c + '*/');
    });

    Coca.Builder.addType('String', function(s) {
        // This will go much better if we simply require JSON.stringify
        // and use that here, but I did not want to introduce that
        // requirement right now.
        this.push('"' + s.replace(/"/g, '\"') + '"');
    });

    Coca.Builder.addType('Array', function(ms) {
        this.members = ms || [];
    }, function(s) {
        return '[' + this.members.join(', ') + ']';
    }, {
        addMember: function(m) {
            this.members.push(m);
        }
    });

    Coca.Builder.addType('Object', function(o) {
        this.properties = o || {};
    }, function(s) {
        var ps = [];
        for (var p in this.properties)
            if (this.properties.hasOwnProperty(p))
                ps.push("'" + p + "':" + this.properties[p]);
        return '{' + ps.join(',') + '}';
    });

    Coca.Builder.addType('Group', null, function(s) {
        return '(' + s + ')';
    });

    Coca.Builder.addType('Function', function(name, args) {
        this.name = name || '';
        this.args = args || [];
    }, function(s) {
        return 'function ' + this.name + '(' + this.args.join(', ') + ') {' + s + '}';
    });

    Coca.Builder.addType('Invocation', function(args) {
        this.args = args || [];
    }, function(s) {
        return '(' + this.args.join(', ') + ')';
    });

    Coca.Builder.addType('Variables', function(vars) {
        this.vars = vars;
    }, function(s) {
        var vars = [];
        for (var i = 0, l = this.vars.length, v; i <  l; i++) {
            v = this.vars[i][0];
            if (this.vars[i].length > 1)
                v += ' = ' + this.vars[i][1];
            vars.push(v);
        }
        return 'var ' + vars.join(', ');
    });

    Coca.Builder.addType('Return', function(v) {
        this.push('return ');
        this.push(v);
        this.endStatement();
    });

    Coca.Builder.addType('If', function(e) {
        this.expr = e;
    }, function(s) {
        var src = 'if (' + this.expr + ') {' + s + '}';
        if (this['else'])
            src += this['else'];
        return src;
    }, {
        addElse: function() {
            return (this['else'] = new Coca.Builder.Else());
        }
    });

    Coca.Builder.addType('Else', null, function(s) {
        var src = 'else ';
        if (this['if'])
            src += this['if'];
        else
            src += '{' + s + '}';
        return src;
    }, {
        withIf: function(e) {
            return (this['if'] = new Coca.Builder.If(e));
        }
    });

    Coca.Builder.addType('For', function(init, test, step) {
        this.exprs = [init || '', test || '', step || ''];
    }, function(s) {
        return 'for (' + this.exprs.join(';') + ') {' + s + '}';
    });

    Coca.Builder.addType('ForIn', function(lh, e) {
        this.lh = lh;
        this.expr = e;
    }, function(s) {
        return 'for (' + this.lh + ' in ' + this.expr + ') {' + s + '}';
    });

    Coca.Builder.addType('Do', null, function(s) {
        var src = 'do {' + s + '}';
        if (this['while']) {
            src += this['while'];
            this.endStatement();
        }
        return src;
    }, {
        withWhile: function(e) {
            return (this['while'] = new Coca.Builder.While(e, true));
        }
    });

    Coca.Builder.addType('While', function(e, empty) {
        this.expr = e;
        this.empty = empty;
    }, function(s) {
        var src = 'while (' + this.expr + ')';
        if (this.empty)
            this.endStatement();
        else
            src += '{' + s + '}';
        return src;
    });

    Coca.Builder.addType('Switch', function(e) {
        this.expr = e;
    }, function(s) {
        return 'switch (' + this.expr + ') { ' + s + ' }';
    });

    Coca.Builder.addType('Case', function(e) {
        this.push('case ' + e + ':');
    });

    Coca.Builder.addType('Label', function(s) {
        this.push(s + ':');
    });

    Coca.Builder.addType('Throw', function(e) {
        this.push('throw ' + e);
        this.endStatement();
    });

    Coca.Builder.addType('Try', null, function(s) {
        var src = 'try {' + s + '}';
        if (this['catch'])
            src += this['catch'];
        if (this['finally'])
            src += this['finally'];
        return src;
    }, {
        withCatch: function(id) {
            return (this['catch'] = new Coca.Builder.Catch(id));
        },
        withFinally: function() {
            return (this['finally'] = new Coca.Builder.Finally());
        }
    });

    Coca.Builder.addType('Catch', function(id) {
        this.id = id;
    }, function(s) {
        return 'catch (' + this.id + ') {' + s + '}';
    });

    Coca.Builder.addType('Finally', null, function(s) {
        return 'finally {' + s + '}';
    });

    Coca.Builder.addType('With', function(e) {
        this.expr = e;
    }, function(s) {
        return 'with (' + this.expr + ') {' + s + '}';
    });
})();
