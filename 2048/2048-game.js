
var expectOutput = function(fn, a, b){
    var _a = JSON.stringify(a),
        _b = JSON.stringify(b),
        _out = JSON.stringify(fn(a)),
        passed = _b == _out;
    console.log("fn(" + _a + ") => " + _out + (passed ? " PASSED!" : " FAILED! Expecting: " + _b));
};

var expectEqual = function(a, b){
    var _a = JSON.stringify(a),
        _b = JSON.stringify(b),
        passed = _b == _a;
    console.log(_a + " => " + _b + (passed ? " PASSED!" : " FAILED!"));
};


var
    lazyProtoProp = function(fn, name){
        var propName = name || ("__" + fn.name) || "__" + Math.random().toString(36).slice(2),
            called = false;
        return function(){
            return called ? this[propName] : (called = true) && (this[propName] = fn.apply(this, arguments));
        }
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
    indexFor = function(x, y){
        return (y - 1) * size + (x - 1);
    },

    // returns the x,y coords from the array's 0-based index
    positionFor = function(i){
        return {
            x: (i + 1) % size,
            y: Math.floor(i / size) + 1
        };
    },

    isValidPosition = function(pos){
        return pos.x >= 1 && pos.x <= size &&
               pos.y >= 1 && pos.y <= size
    },

    emptyGrid = function() {
        return [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];
    },

    directions = {
        UP:    { x:  0,  y: -1 },
        RIGHT: { x:  1,  y:  0 },
        DOWN:  { x:  0,  y:  1 },
        LEFT:  { x: -1,  y:  0 }
    },
    traversals = {
        UP:    { x: [0, 1, 2, 3], y: [0, 1, 2, 3] },
        RIGHT: { x: [3, 2, 1, 0], y: [0, 1, 2, 3] },
        DOWN:  { x: [0, 1, 2, 3], y: [3, 2, 1, 0] },
        LEFT:  { x: [0, 1, 2, 3], y: [0, 1, 2, 3] }
    },

    randomCellValue = function() {
        return Math.random() < 0.9 ? 2 : 4;
    }

;

function Game(cells) {
    this.cells = cells ? cells.slice(0) : emptyGrid();
}

extend(Game, {
    begin: function() {
        var board = new Game();
        board.initialize();
        return board;
    }
});

extend(Game.prototype, {
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
    availableCells: lazyProtoProp(function availableCells() {
        return this.cells.reduce(function(base, val, i){
            if(val !== 0)
                base.push(positionFor(i));
        }, []);
    }),
    randomAvailablePosition: function(){
        if (!this.isGameOver()) {
            //TODO: game is over
        }
        var available = this.availableCells(),
            idx = Math.floor(Math.random() * available.length);
        return available[idx];
    },
    isGameOver: lazyProtoProp(function isGameOver(){
        return this.availableCells().length === 0;
    }),
    isGameWon: lazyProtoProp(function isGameWon(){
        return this.cells.indexOf(2048) !== -1;
    }),
    addRandomTile: function() {
        if(!this.isGameOver()) {
            var pos = this.randomAvailablePosition();
            this.cells[indexFor(pos)] = randomCellValue();
        }
    }


});

// move to the right

var board =  [
    [0, 2, 2, 4],
    [2, 4, 8, 16],
    [16, 0, 0, 0],
    [4, 4, 0, 0]
];




//+ transformRow :: [int] -> [int]
var transformRow = function(row){
    var result = [0, 0, 0, 0],
        i = size,
        j;
    while ( i-- ) {
        j = i;
        while ( row[j] === 0 ) { j--; }
        if ( j < 0 ) continue;
        // at this point, j is the index of the next nonzero element of row.
        result[i] = row[j];
        row[j] = 0;
        if( result[i + 1] === result[i] ) {
            result[i + 1] = 2 * result[i+1];
            result[i] = 0;
            i++; // i gets pushed up by 1 here
        }
    }
    return result;
};
// testing
//expectOutput(transformRow, [2,0,0,0], [0,0,0,2]);
//expectOutput(transformRow, [2,2,4,4], [0,0,4,8]);
//expectOutput(transformRow, [4,4,0,0], [0,0,0,8]);
//expectOutput(transformRow, [0,2,2,4], [0,0,4,4]);
//expectOutput(transformRow, [4,4,2,4], [0,8,2,4]);
//expectOutput(transformRow, [4,4,4,4], [0,0,8,8]);
//expectOutput(transformRow, [4,2,4,0], [0,4,2,4]);



var
    directions = {
        UP:    "UP",
        RIGHT: "RIGHT",
        DOWN:  "DOWN",
        LEFT:  "LEFT"
    },
    traversals = {
        UP:    { a: [1,2,3,4], b: [4,3,2,1], vertical: true },
        RIGHT: { a: [1,2,3,4], b: [1,2,3,4], vertical: false },
        DOWN:  { a: [1,2,3,4], b: [1,2,3,4], vertical: true },
        LEFT:  { a: [1,2,3,4], b: [4,3,2,1], vertical: false }
    };

var cellsToRows = function(traversal, cells){
    var vert = traversal.vertical;
    return reduce(function(result, i){
        result.push(
            reduce(function(row, j){
                return row.concat(cells[indexFor(vert ? i : j, vert ? j : i)]);
            }, [], traversal.b)
        );
        return result;
    }, [], traversal.a);
};

//var move = compose(cellsToRows, map(transformRow));

expectEqual(cellsToRows(traversals[directions.RIGHT],
    [
         0,  1,  2,  3,
         4,  5,  6,  7,
         8,  9, 10, 11,
        12, 13, 14, 15
    ]),
    [
        [  0,  1,  2,  3 ],
        [  4,  5,  6,  7 ],
        [  8,  9, 10, 11 ],
        [ 12, 13, 14, 15 ]
    ]
);

expectEqual(cellsToRows(traversals[directions.LEFT],
    [
        0,  1,  2,  3,
        4,  5,  6,  7,
        8,  9, 10, 11,
        12, 13, 14, 15
    ]),
    [
        [  0,  1,  2,  3 ].reverse(),
        [  4,  5,  6,  7 ].reverse(),
        [  8,  9, 10, 11 ].reverse(),
        [ 12, 13, 14, 15 ].reverse()
    ]
);

expectEqual(cellsToRows(traversals[directions.DOWN],
    [
         0,  1,  2,  3,
         4,  5,  6,  7,
         8,  9, 10, 11,
        12, 13, 14, 15
    ]),
    [
        [ 0,  4,  8, 12 ],
        [ 1,  5,  9, 13 ],
        [ 2,  6, 10, 14 ],
        [ 3,  7, 11, 15 ]
    ]
);

expectEqual(cellsToRows(traversals[directions.UP],
    [
        0,  1,  2,  3,
        4,  5,  6,  7,
        8,  9, 10, 11,
        12, 13, 14, 15
    ]),
    [
        [ 0,  4,  8, 12 ].reverse(),
        [ 1,  5,  9, 13 ].reverse(),
        [ 2,  6, 10, 14 ].reverse(),
        [ 3,  7, 11, 15 ].reverse()
    ]
);









function GameManager() {
    this.game = null;
}

extend(GameManager.prototype, {

    restart: function() {
        this.game = Game.begin();
    },
    move: function(direction) {
        // 0: up, 1: right, 2: down, 3: left
        var game = this.game;

        if (game.isLost) return; // Don't do anything if the game's over

        var
            pos,
            tile,
            vector = directions[direction],
            traversals = traversalsFor(vector),
            moved = false
        ;

        // Traverse the grid in the right direction and move tiles
        traversals.x.forEach(function (x) {
            traversals.y.forEach(function (y) {
                pos = { x: x, y: y };
                tile = self.grid.cellContent(pos);

                if (tile) {
                    var positions = self.findFarthestPosition(pos, vector);
                    var next = self.grid.cellContent(positions.next);

                    // Only one merger per row traversal?
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        var merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];

                        self.grid.insertTile(merged);
                        self.grid.removeTile(tile);

                        // Converge the two tiles' positions
                        tile.updatePosition(positions.next);



                        // Update the score
                        self.score += merged.value;

                        // The mighty 2048 tile
                        if (merged.value === 2048) self.won = true;
                    } else {
                        self.moveTile(tile, positions.farthest);
                    }

                    if (!self.positionsEqual(pos, tile)) {
                        moved = true; // The tile moved from its original cell!
                    }
                }
            });
        });
    }

});














// Game UI
var updateUI = (function(){
    var $cells = $(".cell"),
        allClasses = "v2 v4 v8 v16 v32 v64 v128 v256 v512 v1024 v2048",
        classFor = function(val){
            return val ? ("v" + val) : "";
        };

    return each(function(val,idx){
        $($cells[idx]).removeClass(allClasses).addClass(classFor(val));
    });
}());






//Maybe(x).bind(f) == Maybe(f(x)); // for all f, x
//
//Maybe(x).bind(identity) == Maybe(x); // for all x
//
//Maybe(x).bind(f).bind(g) == Maybe(x).bind(compose(f, g)); // for all x, f, g




