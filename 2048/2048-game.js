




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
    this.isLost = this.isGameOver();
    this.isWon = this.isGameWon();
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
    valueAt: function(x, y){
        return this.cells[indexFor(x,y)];
    },
    isOccupied: function (x, y){
        return this.cells[indexFor(x,y)] !== 0;
    },
    availableCells: function() {
        return this.cells.reduce(function(base, el, i){
            if(el !== 0)
                base.push(positionFor(i));
        }, []);
    },
    randomAvailablePosition: function(){
        var available = this.availableCells();
        if (!available.length) {
            //TODO: game is over
        }
        var idx = Math.floor(Math.random() * available.length);
        return available[idx];
    },
    isGameOver: function(){
        return this.availableCells().length === 0;
    },
    isGameWon: function(){
        return this.cells.indexOf(2048) !== -1;
    },
    addRandomTile: function() {
        if(!this.isLost) {
            var pos = this.randomAvailablePosition();
            this.cells[indexFor(pos)] = randomCellValue();
        }
    }


});



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









