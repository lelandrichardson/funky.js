
var expectOutput = function(fn, a, b){
    var _a = JSON.stringify(a),
        _b = JSON.stringify(b),
        _out = JSON.stringify(fn(a)),
        passed = _b == _out;
    console.log("fn(" + _a + ") => " + _out + (passed ? " PASSED!" : " FAILED! Expecting: " + _b));
};

var expectEqual = curry(function(a, b){
    var _a = JSON.stringify(a),
        _b = JSON.stringify(b),
        passed = _b == _a;
    console.log(_a + " => " + _b + (passed ? " PASSED!" : " FAILED!"));
    }),
    expectTrue = expectEqual(true),
    expectFalse = expectEqual(false)
;



var
    lazyProtoProp = function(fn, name){
        var propName = name || ("__" + fn.name) || "__" + Math.random().toString(36).slice(2);
        return function(){
            return this.hasOwnProperty(propName) ?
                this[propName] :
                (this[propName] = fn.apply(this, arguments));
        };
    }

;



// game board is stored in a 16-element array

/*
    0   1   2   3
    4   5   6   7
    8   9   10  11
    12  13  14  15
 */


var
    size = 4,
    // returns the 0-based index for the board's x,y position
    // Number, Number -> Number
    indexFor = function(x, y){
        if(x > 4 || y > 4 || x < 1 || y < 1) return -1;
        return (y - 1) * size + (x - 1);
    },

    // returns the x,y coords from the array's 0-based index
    // Number -> { x, y }
    positionFor = function(i){
        return {
            x: (i % size) + 1,
            y: Math.floor(i / size) + 1
        };
    },

    //
    withinBounds =  function(){

    },

    // -> [Number]
    emptyGrid = function() {
        return [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];
    },

    directions = {
        UP:    "UP",
        RIGHT: "RIGHT",
        DOWN:  "DOWN",
        LEFT:  "LEFT"
    },

    traversals = {
        UP:    { a: [1,2,3,4], b: [4,3,2,1], vertical: true, dir: "UP" },
        RIGHT: { a: [1,2,3,4], b: [1,2,3,4], vertical: false, dir: "RIGHT"},
        DOWN:  { a: [1,2,3,4], b: [1,2,3,4], vertical: true, dir: "DOWN" },
        LEFT:  { a: [1,2,3,4], b: [4,3,2,1], vertical: false, dir: "LEFT" }
    },

    // direction -> [Number] -> [[Number]]
    cellsToRows = curry(function(direction, cells){
        var traversal = traversals[direction],
            vert = traversal.vertical;
        return reduce(function(result, i){
            result.push(
                reduce(function(row, j){
                    return row.concat(cells[indexFor(vert ? i : j, vert ? j : i)]);
                }, [], traversal.b)
            );
            return result;
        }, [], traversal.a);
    }),



    // direction -> [[Number]] -> [Number]
    rowsToCells = curry(function(dir, rows){
        switch(dir){
            case directions.UP:
                return reverse(flatten(map(function(row, i){ return reverse(pluck(i, rows));}, rows)));
            case directions.DOWN:
                return flatten(map(function(row, i){ return pluck(i, rows); }, rows));
            case directions.RIGHT:
                return flatten(rows);
            case directions.LEFT:
                return flatten(rows.map(reverse));
        }
    }),

    // applies "gravity" to an array of numbers, from left to right, and mergues them where appropriate
    // [int] -> [int]
    transformRow = function(row){
        var result = [0, 0, 0, 0],
            i = size,
            j,
            lastWasMerged = false;
        while ( i-- ) {
            j = i;
            while ( row[j] === 0 ) { j--; }
            if ( j < 0 ) continue;
            // at this point, j is the index of the next nonzero element of row.
            result[i] = row[j];
            row[j] = 0;
            if( result[i + 1] === result[i] && !lastWasMerged) {
                result[i + 1] = 2 * result[i+1];
                result[i] = 0;
                i++; // i gets pushed up by 1 here
                lastWasMerged = true;
            } else {
                lastWasMerged = false;
            }
        }
        return result;
    },


    move = function(direction) {
        return compose(rowsToCells(direction), map(transformRow), cellsToRows(direction));
    },

    // -> Number
    randomCellValue = function() {
        return Math.random() < 0.9 ? 2 : 4;
    }

;

function Game(cells) {
    this.cells = cells || emptyGrid();
}
extend(Game, {
    begin: function() {
        var board = new Game();
        board.initialize();
        return board;
    }
});

extend(Game.prototype, {
    map: function(fn){
        return map(fn, this.cells);
    },
    fold: function(fn,base){
        return fold(fn, base, this.cells);
    },


    initialize: function(){
        this.addRandomTile();
        this.addRandomTile();
    },
    valueAt: function(x, y){ //TODO: maybe change to accept a full position
        return this.cells[indexFor(x,y)];
    },
    isOccupied: function (x, y){
        return this.cells[indexFor(x,y)] !== 0;
    },
    availableCells: function availableCells() {
        // TODO: caching the value presented some problems since we are calling
        // TODO: before random tiles are added
        // NOTE: it seems like filter() should work here, but doesn't because we need the index, not the value
        return reduce(function(base, val, i){
            if(val === 0) base.push(i);
            return base;
        }, [], this.cells);
    },
    mergesArePossible: function(){
        var self = this;
        return some(function(val, idx){
            if(!val) return;
            var p = positionFor(idx);
            return self.valueAt(p.x+1, p.y  ) === val ||
                   self.valueAt(p.x-1, p.y  ) === val ||
                   self.valueAt(p.x  , p.y+1) === val ||
                   self.valueAt(p.x  , p.y-1) === val ;
        }, this.cells);
    },
    randomAvailableIndex: function(){
        var available = this.availableCells(),
            idx = Math.floor(Math.random() * available.length);
        return available[idx];
    },
    isGameOver: function isGameOver(){
        return this.availableCells().length === 0 && !this.mergesArePossible();
    },
    isGameWon: function isGameWon(){
        return this.cells.indexOf(2048) !== -1;
    },
    addRandomTile: function() {
        if(this.isGameOver()) return;
        this.cells[this.randomAvailableIndex()] = randomCellValue();
    },
    move: function(direction){
        var next = new Game(move(direction)(this.cells));
        if(deepEquals(this.cells, next.cells)) return null;
        return next;
    }
});










function GameManager() {
    this.restart();
}

extend(GameManager.prototype, {

    restart: function() {
        this.history = [];
        this.game = Game.begin();
        this.updateUI();
    },

    undo: function() {
        if (this.history.length === 0) return;
        this.game = this.history.pop();
        this.updateUI();
    },

    move: function(direction){
        var next = this.game.move(direction);
        if (next === null) return;
        this.history.push(this.game);
        this.game = next;
        next.addRandomTile();
        this.updateUI();
    },

    updateUI: function(){
        updateUI(this);
    },

    solve: function() {
        var self = this;
        if(self.solveTimeout) {
            clearTimeout(self.solveTimeout);
            self.solveTimeout = null;
            return;
        }
        var thinkAndMove = function (){
            if(self.game.isGameOver() || self.game.isGameWon()) {
                self.solveTimeout = null;
                return;
            }
            var solver = new Solver(self.game);
            var bestMove = solver.iterativeDeep();
            self.move(bestMove.move);
            self.solveTimeout = setTimeout(thinkAndMove, 0)
        };

        self.solveTimeout = setTimeout(thinkAndMove, 0);
    }

});




//var input = [
//    0,  1,  2,  3,
//    4,  5,  6,  7,
//    8,  9, 10, 11,
//    12, 13, 14, 15
//];
//["UP","DOWN","RIGHT","LEFT"].forEach(function(direction){
//    console.log(direction + ":");
//    expectEqual( rowsToCells(direction, cellsToRows(traversals[direction], input)),input);
//});
//


















// Game UI
var
    updateCells = (function(){
        var $cells = $(".cell"),
            allClasses = "v2 v4 v8 v16 v32 v64 v128 v256 v512 v1024 v2048",
            classFor = function(val){
                return val ? ("v" + val) : "";
            };

        return each(function(val, idx){
            $($cells[idx]).removeClass(allClasses).addClass(classFor(val));
        });
    }()),
    updateUI = (function(){
        var $gameOver = $(".game-over");
        var $gameWon = $(".game-won");
        var $solve = $(".solve");
        return function(manager){
            updateCells(manager.game.cells);
            manager.game.isGameOver() ? $gameOver.show() : $gameOver.hide();
            manager.game.isGameWon() ? $gameWon.show() : $gameWon.hide();

            $solve.text(manager.solveTimeout ? "STOP" : "SOLVE")
        };
    }());


var manager = new GameManager();

$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
            manager.move(directions.LEFT);
            break;
        case 38: // up
            manager.move(directions.UP);
            break;
        case 39: // right
            manager.move(directions.RIGHT);
            break;
        case 40: // down
            manager.move(directions.DOWN);
            break;
        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(".undo").click(function(){ manager.undo();});
$(".restart").click(function(){ manager.restart();});
$(".solve").click(function(){ manager.solve();});



//expectOutput(transformRow, [2,0,0,0], [0,0,0,2]);
//expectOutput(transformRow, [2,2,4,4], [0,0,4,8]);
//expectOutput(transformRow, [4,4,0,0], [0,0,0,8]);
//expectOutput(transformRow, [0,2,2,4], [0,0,4,4]);
//expectOutput(transformRow, [4,4,2,4], [0,8,2,4]);
//expectOutput(transformRow, [4,4,4,4], [0,0,8,8]);
//expectOutput(transformRow, [4,2,4,0], [0,4,2,4]);
//expectOutput(transformRow, [4,2,2,0], [0,0,4,4]);