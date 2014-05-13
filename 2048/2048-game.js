// game board is stored in a 16-element array

/*
    0   1   2   3
    4   5   6   7
    8   9   10  11
    12  13  14  15
 */

// the size of the board. Note: right now, this constant is used wherever practical,
// but I do believe changing this to something other than 4 will break a couple of things.
var size = 4;

// returns the 0-based index for the board's x,y position
// returns -1 if index outside of expected range.
// x,y indices are 1-based.
//+ indexFor :: int, int -> int
var indexFor = function (x, y) {
    if(x > size || y > size || x < 1 || y < 1) return -1;
    return (y - 1) * size + (x - 1);
};

// returns the x,y coordinates from the array's 0-based index
//+ positionFor :: int -> { x:int, y:int }
var positionFor = function (i) {
    return {
        x: (i % size) + 1,
        y: Math.floor(i / size) + 1
    };
};

//+ emptyGrid :: -> [int]
var emptyGrid = function () {
    return [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ];
};

// an enumeration of the 4 different directions.
var directions = {
    UP:    "UP",
    RIGHT: "RIGHT",
    DOWN:  "DOWN",
    LEFT:  "LEFT"
};

// a lookup of useful properties of each direction.
// NOTE: looking for a way to clean this up.
var traversals = {
    UP:    { a: [1,2,3,4], b: [4,3,2,1], vertical: true, dir: "UP" },
    RIGHT: { a: [1,2,3,4], b: [1,2,3,4], vertical: false, dir: "RIGHT"},
    DOWN:  { a: [1,2,3,4], b: [1,2,3,4], vertical: true, dir: "DOWN" },
    LEFT:  { a: [1,2,3,4], b: [4,3,2,1], vertical: false, dir: "LEFT" }
};


// this function takes a 16-length array, and converts it into an array of arrays
// where each child array represents a "row" to be transformed in a move
// NOTE: this function seems hard to understand as is. I would like to clean up, but
//       can't see a clear path to do so.
//+ cellsToRows :: direction -> [int] -> [[int]]
var cellsToRows = curry(function (direction, cells) {
    var traversal = traversals[direction],
        vert = traversal.vertical;

    return reduce(function (result,  i) {
        result.push(
           reduce(function (row, j){
                return row.concat(cells[indexFor(vert ? i : j, vert ? j : i)]);
            }, [], traversal.b)
        );
        return result;
    }, [], traversal.a);
});

// this function is the inverse of `cellsToRows`.
// NOTE: this function seems hard to understand as is. I would like to clean up, but
//       can't see a clear path to do so.
//+ rowsToCells :: direction -> [[int]] -> [int]
var rowsToCells = curry(function (dir, rows) {
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
});

// applies "gravity" to an array of numbers, from left to right, and merges them where appropriate
//+ transformRow :: [int] -> [int]
var transformRow = function(row){
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
            // "merge" the two cells
            result[i + 1] = 2 * result[i+1];
            result[i] = 0;
            i++; // i gets pushed up by 1 here
            lastWasMerged = true;
        } else {
            lastWasMerged = false;
        }
    }
    return result;
};
//test(transformRow, [2,2,4,4], [0,0,4,8]);


//+ move :: direction -> [int] -> [int]
var move = function(direction) {
    return compose(rowsToCells(direction), map(transformRow), cellsToRows(direction));
};

//+ randomCellValue :: -> Number
var randomCellValue = function() {
    return Math.random() < 0.9 ? 2 : 4;
};







function Game(cells) {
    this.cells = cells || emptyGrid();
}

Game.prototype.map = function(fn){
    return map(fn, this.cells);
};

Game.prototype.fold = function(fn, base){
    return fold(fn, base, this.cells);
};

Game.prototype.initialize = function(){
    this.addRandomTile();
    this.addRandomTile();
};

Game.prototype.valueAt = function(x, y){
    return this.cells[indexFor(x,y)];
};

Game.prototype.availableCells = function availableCells() {
    // NOTE: it seems like filter() should work here, but doesn't
    //       because we need the index (i), not the value (v)
    return this.fold(function(base, val, i){
        if(val === 0) base.push(i);
        return base;
    }, []);
};

Game.prototype.mergesArePossible = function(){
    var self = this;
    return some(function(val, idx){
        if(!val) return;
        var p = positionFor(idx);
        return self.valueAt( p.x+1 , p.y   ) === val ||
               self.valueAt( p.x-1 , p.y   ) === val ||
               self.valueAt( p.x   , p.y+1 ) === val ||
               self.valueAt( p.x   , p.y-1 ) === val ;
    }, this.cells);
};

Game.prototype.randomAvailableIndex = function(){
    var available = this.availableCells(),
        idx = Math.floor(Math.random() * available.length);
    return available[idx];
};

Game.prototype.isGameOver = function (){
    return this.availableCells().length === 0 && !this.mergesArePossible();
};

Game.prototype.isGameWon = function (){
    return this.cells.indexOf(2048) !== -1;
};

Game.prototype.addRandomTile = function() {
    if(this.isGameOver()) return;
    this.cells[this.randomAvailableIndex()] = randomCellValue();
};

Game.prototype.move = function(direction){
    var next = new Game(move(direction)(this.cells));
    if (deepEquals(this.cells, next.cells)) return null;
    return next;
};












function GameManager(updateUI) {
    this.updateUI = updateUI;
    this.restart();
}

GameManager.prototype.restart = function() {
    this.history = [];
    this.game = new Game();
    this.game.initialize();
    this.updateUI();
};

GameManager.prototype.undo = function() {
    if (this.history.length === 0) return;
    this.game = this.history.pop();
    this.updateUI();
};

GameManager.prototype.move = function(direction){
    var next = this.game.move(direction);
    if (next === null) return;
    this.history.push(this.game);
    this.game = next;
    next.addRandomTile();
    this.updateUI();
};