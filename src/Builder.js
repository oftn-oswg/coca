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
                    if (fn)
                        fn.apply(this, arguments);
                    P.apply(this);
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
                C.apply(o, arguments)
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
    Coca.Builder.Source.prototype.addComment = function(s) {
        return this.push('/* ' + s + ' */');
    };
    Coca.Builder.Source.prototype.addEmpty = function() {
        return  this.push(';');
    };

    Coca.Builder.addType('Function', function(name, args) {
        this.name = name || '';
        this.args = args || [];
    }, function(s) {
        return 'function ' + this.name + '(' + this.args.join(', ') + ') {' + s + '}';
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
        return 'var ' + vars.join(', ') + ';'
    });

    Coca.Builder.addType('If', function(expr) {
        this.expr = expr;
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
        withIf: function(expr) {
            return (this['if'] = new Coca.Builder.If(expr));
        }
    });

    Coca.Builder.addType('Group', null, function(s) {
        return '(' + s + ')';
    });
})();
