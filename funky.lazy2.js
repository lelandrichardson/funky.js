(function(){

    function isFunction(obj){
        return obj instanceof Function;
    }

    function Lazy(arrayOrNextFn, parent) {
        this.index = -1;
        if(isFunction(arrayOrNextFn)) {
            this.next = arrayOrNextFn.bind(this, parent, STOP);
            this.parent = parent;
        } else {
            this._underlying = arrayOrNextFn;
            this.index = -1;
            this.length = arrayOrNextFn.length;
        }
    }


    Lazy.fn = Lazy.prototype;

    var STOP = Lazy.STOP =  {};

    Lazy.fn.iterator = function() {
        var i = -1;
        return {
            next: (this.next || function() {
                return ++i < this._underlying.length ?
                    this._underlying[i]
                    : STOP;
            }).bind(this)
        };
    };

    Lazy.fn.each = function (fn) {
        var iterator = this.iterator(),
            i = -1,
            next;
        while ((next = iterator.next()) !== STOP)
            fn(next, ++i);
    };

    //+ Function<T,V> -> Lazy<V>
    Lazy.fn.map = function(mapFn) {
        return new Lazy(function(parent, done) {
            var iter = parent.iterator(), x = iter.next();
            return x === done ? done : mapFn(x);
        }, this);
    };

    //+ Function<V,T,V>, V -> V
    Lazy.fn.fold = function(fn, base) {
        var result = base;
        this.each(function(el) {
            result = fn(result, el);
        });
        return result;
    };

    //+ Function -> Lazy
    Lazy.fn.filter = function(fn) {
        return new Lazy(function (next, done) {
            var item, i = 0;
            while ((item = next()) !== done) {
                if ( !!fn(item, i++) ) {
                    return item;
                }
            }
            return done;
        }, this);
    };

    Lazy.fn.value = function () {
        //if("_underlying" in this) { return this._underlying; }
        return this.fold(function(result, el){
            result.push(el);
            return result;
        }, []);
    };





    window.eachAsync = eachAsync;
    window.Lazy = Lazy;

}());


//eachAsync(function(el, done) {
//    setTimeout(function(){
//        console.log(el);
//        done();
//    },1000);
//}, [1,2,3,4]);

var a = new Lazy([0,1,2]);

var b = a.map(function(x){return x+1;});

//var c = b.value();
//
//console.log(c);