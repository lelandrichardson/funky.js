

var _onCells = function(fn){
    return function(){
        return fn.apply(this, toArray(arguments).concat(this.cells));
    };
};

var
    // Number -> Number
    realValue = function(x){
        return x === 0 ? 0 : Math.log(x) / Math.log(2);
    },

    vectors = {
        0: { x: 0,  y: -1 }, // up
        1: { x: 1,  y: 0 },  // right
        2: { x: 0,  y: 1 },  // down
        3: { x: -1, y: 0 }   // left
    },

    // [Number] -> boolean
    monotonic = function(row){
        if(!row || row.length < 2) return true; // 0 or 1 elements. has to be monotonic.

        var a = row[0],
            b = firstWhere(op["!=="](a), row) ,
            up = b - a > 0,
            last;

        if(isUndefined(b)) return true; // the whole list is a single value

        return every(function(val){
            last = a; a = val;
            return up ? val >= last : val <= last;
        }, row);
    },

    monotonicity = function(row){
        if(!row || row.length < 2) return true; // 0 or 1 elements. has to be monotonic.

        var a = row[0],
            b = firstWhere(op["!=="](a), row) ,
            up = b - a > 0,
            last;

        if(isUndefined(b)) return 0; // the whole list is a single value

        return reduce(function(score, val){
            last = a; a = val;
            return score + (up ? realValue(val) - last : last - realValue(val));
        }, 0, row);
    }
;


extend(Game.prototype, {
    clone: function(){
        return new Game(this.cells.slice(0));
    },
    smoothness: function(){
        var self = this;
        return reduce(function(smoothness, val, i){
            if( val > 0 ) {
                var value = realValue(val),
                    r = positionFor(i),
                    neighbors = [
                        self.valueAt(r.x, r.y+1),
                        self.valueAt(r.x+1, r.y)
                    ];
                return smoothness - compose(
                    sum,
                    map(function(z){ return Math.abs(value - realValue(z)); }),
                    filter(truthy)
                )(neighbors);
            }
            return smoothness;
        }, 0, this.cells);
    },
    monotonicity: function(){
        var rows = flatten([
            cellsToRows(directions.RIGHT, this.cells),
            cellsToRows(directions.DOWN, this.cells)
        ]);

        return sum(map(monotonicity)(rows));
    },

    smooth2: function() {
        var smoothness = 0;
        for (var x=1; x<=4; x++) {
            for (var y=1; y<=4; y++) {
                if ( this.valueAt(x, y) ) {
                    var value = realValue(this.valueAt(x, y));
                    for (var direction=1; direction<=2; direction++) {
                        var vector = vectors[direction];
                        var targetPosition = this.findFarthestPosition({x: x, y: y}, vector).next;

                        var target = this.valueAt(targetPosition.x, targetPosition.y)
                        if (target) {
                            smoothness -= Math.abs(value - realValue(target));
                        }
                    }
                }
            }
        }
        return smoothness;
    },
    findFarthestPosition: function(position, vector){
        var previous,
            r = position;

        // Progress towards the vector direction until an obstacle is found
        do {
            previous = r;
            r     = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (indexFor(r.x, r.y) !== -1 && this.valueAt(r.x, r.y) === 0);

        return {
            farthest: previous,
            next: r // Used to check if a merge is required
        };
    },


    mono2: function() {
        // scores for all four directions
        var totals = [0, 0, 0, 0];
        var current;
        var next;
        var nextValue;
        var currentValue;
        // up/down direction
        for (var x=1; x<=4; x++) {
            current = 1;
            next = current + 1;
            while ( next<=4 ) {
                while ( next<=4 && !this.valueAt(x, next )){
                    next++;
                }
                if (next>4) { next--; }
                currentValue = realValue(this.valueAt(x, current));
                nextValue = realValue(this.valueAt(x, next));
                if (currentValue > nextValue) {
                    totals[0] += nextValue - currentValue;
                } else if (nextValue > currentValue) {
                    totals[1] += currentValue - nextValue;
                }
                current = next;
                next++;
            }
        }

        // left/right direction
        for (var y=1; y<=4; y++) {
            current = 1;
            next = current+1;
            while ( next<=4 ) {
                while ( next<=4 && !this.valueAt(next, y)) {
                    next++;
                }
                if (next>4) { next--; }

                currentValue = realValue(this.valueAt(current, y));
                nextValue = realValue(this.valueAt(next, y));

                if (currentValue > nextValue) {
                    totals[2] += nextValue - currentValue;
                } else if (nextValue > currentValue) {
                    totals[3] += currentValue - nextValue;
                }
                current = next;
                next++;
            }
        }

        return Math.max(totals[0], totals[1]) + Math.max(totals[2], totals[3]);
    },

    islands: function() {
        var self = this;
        var direction, x, y, i;
        var marks =  new Array(size*size);
        var mark = function(i, x, y, value) {
            if ( x >= 1 && x <= 4 && y >= 1 && y <= 4 &&
                self.cells[i] === value && !marks[i] ) {
                marks[i] = true;

                for (direction in [0,1,2,3]) {
                    var vector = vectors[direction];
                    mark(indexFor(x + vector.x, y + vector.y), x + vector.x, y + vector.y, value);
                }
            }
        };

        var islands = 0;

        for (x=1; x<=4; x++) {
            for (y=1; y<=4; y++) {
                i = indexFor(x,y);
                if (this.cells[i]) {
                    marks[i] = false
                }
            }
        }
        for (x=1; x<=4; x++) {
            for (y=1; y<=4; y++) {
                i = indexFor(x,y);
                if (this.cells[i] && !marks[i]) {
                    islands++;
                    mark(indexFor(x,y), {x:x, y:y}, this.cells[i]);
                }
            }
        }

        return islands;
    },


    emptyCells: function(){
        return countWhere(falsy, this.cells);
    },

    maxValue: function(){
        return max(this.cells);
    },

    weight_smooth: 0.1,
    weight_monotonicity: 1.0,
    weight_empty: 2.7,
    weight_max: 1.0,

    evaluate: function() {
        return this.smooth2() * this.weight_smooth
            + this.mono2() * this.weight_monotonicity
            + Math.log(this.emptyCells()) * this.weight_empty
            + realValue(this.maxValue()) * this.weight_max;
    }
});



function Solver(game, isOpponent){
    this.game = game;
    this.isOpponent = !!isOpponent;
}

extend(Solver.prototype,{

    searchTime: 50,

    iterativeDeep: function(){
        var start = (new Date()).getTime();
        var depth = 0;
        var best;
        do {
            var newBest = this.search(depth, -10000, 10000, 0 ,0);
            if (newBest.move == -1) {
                //console.log('BREAKING EARLY');
                break;
            } else {
                best = newBest;
            }
            depth++;
        } while ((new Date).getTime() - start < this.searchTime);
        //console.log(best);
        return best;
    },

    search: function(depth, alpha, beta, positions, cutoffs) {

        var bestMove = -1,
            bestScore,
            result,
            next,
            solver;

        // the maxing player
        if (!this.isOpponent) {
            bestScore = alpha;
            for (var direction in directions) {
                next = this.game.move(direction);
                if(next === null) continue; // move isn't possible
                positions++;
                if (next.isGameWon()) {
                    return { move: direction, score: 10000, positions: positions, cutoffs: cutoffs };
                }

                solver = new Solver(next, !this.isOpponent);

                if (depth === 0) {
                    result = { move: direction, score: next.evaluate() };
                } else {
                    result = solver.search(depth-1, bestScore, beta, positions, cutoffs);
                    if (result.score > 9900) { // win
                        result.score--; // to slightly penalize higher depth from win
                    }
                    positions = result.positions;
                    cutoffs = result.cutoffs;
                }

                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = direction;
                }
                if (bestScore > beta) {
                    cutoffs++;
                    return { move: bestMove, score: beta, positions: positions, cutoffs: cutoffs };
                }
            }
        }

        else { // computer's turn, we'll do heavy pruning to keep the branching factor low
            bestScore = beta;

            // try a 2 and 4 in each cell and measure how annoying it is
            // with metrics from eval
            var cells = this.game.availableCells();
            var scores = { 2: [], 4: [] };

            for (var value = 2; value <=4; value+=2) {
                for (var k = 0; k < cells.length; k++) {
                    i = cells[k];
                    this.game.cells[i] = value;
                    scores[value].push({i: i, val: value, score: -this.game.smooth2() + this.game.islands()});
                    this.game.cells[i] = 0;
                }
            }

            // now just pick out the most annoying moves
            var allScores = flatten(scores[2], scores[4])
            var maxScore = max(pluck('score', allScores));
            var candidates = where(function(x){return x.score === maxScore;}, allScores);

            // search on each candidate
            for (var i=0; i<candidates.length; i++) {
                var c = candidates[i];
                next = this.game.clone();
                next.cells[c.i] = c.val;
                positions++;
                solver = new Solver(next, false);
                result = solver.search(depth, alpha, bestScore, positions, cutoffs);
                positions = result.positions;
                cutoffs = result.cutoffs;

                if (result.score < bestScore) {
                    bestScore = result.score;
                }
                if (bestScore < alpha) {
                    cutoffs++;
                    return { move: null, score: alpha, positions: positions, cutoffs: cutoffs };
                }
            }
        }

        return { move: bestMove, score: bestScore, positions: positions, cutoffs: cutoffs };
    }
});