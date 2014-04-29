(function(makeGlobal){
    var
        // add reference to the global object... either 'window' or 'global'
        root = this,

        // old version of global.variables for funky.noConflict() purposes
        _old = {
            funky: root['funky'],
            _: root['_']
        },

        // the global funky object
        funky = {
            noConflict: function(prop) {
                root[prop] = _old[prop];
                return funky[prop];
            }
        },

        // the global "underscore" object for currying.
        _ = {},






        // Array prototype
        __slice = Array.prototype.slice,
        __map = Array.prototype.map,
        __hasProp = Array.prototype.hasOwnProperty, //TODO: shouldn't this be object.prototype?
        __filter = Array.prototype.filter,
        __sort = Array.prototype.sort,
        __some = Array.prototype.some,
        __every = Array.prototype.every,
        __concat = Array.prototype.concat,
        __reverse = Array.prototype.reverse,
        __reduce = Array.prototype.reduce,
        __reduceRight = Array.prototype.reduceRight,
        __join = Array.prototype.join,
        __each = Array.prototype.forEach,
        __indexOfArray = Array.prototype.indexOf,
        __lastIndexOfArray = Array.prototype.lastIndexOf,

        // Function prototype
        __bind = Function.prototype.bind,
        __apply = Function.prototype.apply,
        __call = Function.prototype.call,

        // String prototype
        __split = String.prototype.split,
        __indexOfString = String.prototype.indexOf,


        toArray = function (args) {
            return __slice.call(args);
        },

        // TODO: change to use variadic
        extend = function () {
            var consumer = arguments[0],
                providers = __slice.call(arguments, 1),
                key,
                i,
                provider;

            for (i = 0; i < providers.length; ++i) {
                provider = providers[i];
                for (key in provider) {
                    if (provider.hasOwnProperty(key)) {
                        consumer[key] = provider[key];
                    }
                }
            }
            return consumer;
        },



        curry = function (fn, length, args, holes) {
            length = length || fn.length;
            args = args || [];
            holes = holes || [];
            return function(){
                var _args = args.slice(0),
                    _holes = holes.slice(0),
                    argStart = _args.length,
                    holeStart = _holes.length,
                    arg,
                    i;
                for(i = 0; i < arguments.length; i++) {
                    arg = arguments[i];
                    if(arg === _){
                        if(holeStart){
                            holeStart--;
                            _holes.push(_holes.shift()); // move the hole from beginning of array to end
                        } else {
                            _holes.push(argStart + i); // the position of the hole.
                        }
                    } else if (holeStart) {
                        holeStart--;
                        _args.splice(_holes.shift(), 0, arg); // insert this arg at the index of the hole
                    } else {
                        _args.push(arg);
                    }
                }
                if(_args.length < length) {
                    return curry.call(this, fn, length, _args, _holes);
                } else {
                    return fn.apply(this, _args);
                }
            }
        },




        // operators
        op = {
            // arithmetic
            "+": curry(function (a, b){ return a + b;}),
            "-": curry(function (a, b){ return a - b;}),
            "*": curry(function (a, b){ return a * b;}),
            "/": curry(function (a, b){ return a / b;}),
            "%": curry(function (a, b){ return a / b;}),

            // equality
            "==": curry(function(a, b){return a == b;}),
            "===": curry(function(a, b){return a === b;}),
            "!=": curry(function(a, b){return a != b;}),
            "!==": curry(function(a, b){return a !== b;}),

            // comparison
            "<": curry(function(a, b){return a < b;}),
            ">": curry(function(a, b){return a > b;}),
            "<=": curry(function(a, b){return a <= b;}),
            ">=": curry(function(a, b){return a >= b;}),

            // negation
            "!": function(a){return !a;},
            "!!": function(a){return !!a;}
        },


        variadic = function (fn){
            var argLength = fn.length;

            return function(){
                var args = toArray(arguments),
                    newArgs = __slice.call(args, 0, argLength - 1);

                newArgs.push(__slice.call(args, argLength - 1));

                return fn.apply(this, newArgs);
            }
        },

        // compose(f1, f2, f3..., fn)(args) == f1(f2(f3(...(fn(args...)))))
        compose = function (/* f1, f2, ..., fn */) {
            var fns = arguments,
                length = arguments.length;
            return function () {
                var i = length;
                // we need to go in reverse order
                while ( --i >= 0 ) {
                    arguments = [fns[i].apply(this, arguments)];
                }
                return arguments[0];
            };
        },

        // sequence(f1, f2, f3..., fn)(args...) == fn(...(f3(f2(f1(args...)))))
        sequence = function (/* f1, f2, ..., fn */) {
            var fns = arguments,
                length = arguments.length;
            return function () {
                var i = 0;
                // we need to go in normal order here
                while ( i++ < length ) {
                    arguments = [fns[i].apply(this, arguments)];
                }
                return arguments[0];
            };
        },


        demethodize = function (fn){
            return curry(function(){
                var args = __slice.call(arguments, 1);
                return fn.apply(arguments[0], args);
            });
        },


        comparator = function(pred){
            return function(x, y){
                if(!!pred(x,y)){
                    return -1;
                } else if(!!pred(y,x)){
                    return 1;
                }
                return 0;
            };
        },

        reverse = function (list){
            return __reverse.call(list);
        },

        flip = function (fn){
            //todo
        },

        first = function (list){

        },

        firstWhere = curry(function (fn, list){
            var index = -1,
                length = list ? list.length : 0;
            while (++index < length && !fn(list[index], index, list)) {}
            return list[index];
        }),

        some = curry(function(fn, list){
            return __some.call(list, fn);
        }),

        every = curry(function(fn, list){
            return __every.call(list, fn);
        }),

        until = curry(function (fn, list){

        }),

        //TODO: should this be .first() instead?
        take = curry(function (n, list){

        }),

        map = curry(function (fn, list) {
            return __map.call(list, fn);
        }),

        each = curry(function (fn, list) {
            var i, length;
            for (i = 0,length = list.length; i < length; i++){
                fn(list[i], i);
            }
        }),




        prop = curry(function (name, obj){
            return obj[name];
        }),


        pluck = curry(function (name, list){
            return map(prop(name), list);
        }),

        filter = curry(function (fn, list){
            return __filter.call(list, fn);
        }),

        count = function(list){
            return list.length;
        },
        countWhere = curry(function(fn, list){
            return count(filter(fn,list));
        }),

        //TODO: some OrderBy helpers, common predicates...
        sort = curry(function(pred, list){
            return __sort.call(list, comparator(pred));
        }),

        flatten = function(list){
            return __concat.apply([],list);
        },



        trampoline = function(){

        },

        memoize = function(){

        },

        computeOnce = function(fn){
            var called = false,
                val;
            return function(){
                return called ? val : (called = true) && (val = fn.apply(this, arguments));
            }
        },

        foldl = curry(function(combine, base, list) {
            //todo: use native method or for-loop here
            return __reduce.call(list, combine, base);
//            each(function (element) {
//                base = combine(base, element);
//            }, list);
//            return base;
        }),

        foldr = curry(function(combine, base, list) {
            //todo: use native method or for-loop here
            return foldl(combine, base, reverse(list));
        }),

        value = function(val){
            return function(){ return val; }
        },

        identity = function(x){ return x;},

        nop = function(){},

        sum = foldl(op["+"], 0),// TODO: change to allow a getvalue function parameter

        max = function(list){
            // TODO: change to allow a getvalue function parameter
            // NOTE: allow the getval function to be a string -> prop name
            return Math.max.apply(null, list);
        },

        min = function(list){
            //TODO: should we also cover a function  min(a,b)?
            return Math.min.apply(null, list);
        },

        concat = function(a, b){
            //TODO: handle both strings and arrays???
            //TODO: should/could this be variadic?
        },
        deepEquals = curry(function(a, b){
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (a.length != b.length) return false;

            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }),




        // build an array that is the sequence/range of integers from a .. b
        range = function(start, stop, step) {
            if (arguments.length <= 1) {
                stop = start || 0;
                start = 0;
            }
            step = arguments[2] || 1;

            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var idx = 0;
            var range = new Array(length);

            while(idx < length) {
                range[idx++] = start;
                start += step;
            }

            return range;
        },


        // existential functions
        isUndefined = op["==="](undefined),
        isDefined = op["!=="](undefined),



        // number utilities
        toFixed = demethodize(Number.prototype.toFixed),
        toPrecision = demethodize(Number.prototype.toPrecision),
        toExponential = demethodize(Number.prototype.toExponential),
        toInt = function(num){
            return parseInt(num, 10);
        },
        toFloat = parseFloat,




        _export = function (ns){
            return extend(ns,{
                _: _,
                curry: curry,
                variadic: variadic,
                compose: compose,
                sequence: sequence,
                demethodize: demethodize,

                trampoline: trampoline,
                memoize: memoize,
                computeOnce: computeOnce,

                value: value,
                K: value,
                identity: identity,
                I: identity,
                nop: nop,
                range: range,
                max: max,
                min: min,


                toArray: toArray,
                extend: extend,

                flip: flip,

                each: each,
                map: map,
                first: first,
                firstWhere: firstWhere,
                count: count,
                countWhere: countWhere,
                filter: filter,
                where: filter,
                some: some,
                any: some,
                every: every,
                all: every,
                fold: foldl,
                reduce: foldl,
                foldl: foldl,
                foldLeft: foldl,
                reduceLeft: foldl,
                foldr: foldr,
                foldRight: foldr,
                reduceRight: foldr,
                sort: sort,
                sum: sum,
                reverse: reverse,
                flatten: flatten,

                prop: prop,
                dot: prop,
                pluck: pluck,


                deepEquals: deepEquals,



                // operators
                op: op,
                add: op["+"],
                subtract: op["-"],
                mult: op["*"],
                mod: op["%"],
                modulo: op["%"],

                eq: op["=="],
                eqeq: op["==="],
                equals: op["==="],
                neq: op["!="],
                neqeq: op["!=="],
                lt: op["<"],
                gt: op[">"],
                lteq: op["<="],
                gteq: op[">="],

                not: op["!"],
                falsy: op["!"],
                truthy: op["!!"],


                // existential functions
                isUndefined: isUndefined,
                isDefined: isDefined

            });
        }

    ;


    // make all functions available globally
    makeGlobal && _export(root);

    // attach to global "funky" namespace also.
    root['funky'] = _export(funky);

    Function.prototype.curry = function(n){
        return curry(this, n);
    };


}(/* makeGlobal: */ true));
