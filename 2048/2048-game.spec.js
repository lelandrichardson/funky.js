
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


// testing
expectOutput(transformRow, [2,0,0,0], [0,0,0,2]);
expectOutput(transformRow, [2,2,4,4], [0,0,4,8]);
expectOutput(transformRow, [4,4,0,0], [0,0,0,8]);
expectOutput(transformRow, [0,2,2,4], [0,0,4,4]);
expectOutput(transformRow, [4,4,2,4], [0,8,2,4]);
expectOutput(transformRow, [4,4,4,4], [0,0,8,8]);
expectOutput(transformRow, [4,2,4,0], [0,4,2,4]);
expectOutput(transformRow, [4,2,2,0], [0,0,4,4]);


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






var board =  [
    0, 2, 2, 4,
    2, 4, 8, 16,
    16, 0, 0, 0,
    4, 4, 0, 0
];

expectEqual(moveRight(board),[
    0, 0, 4, 4,
    2, 4, 8, 16,
    0, 0, 0, 16,
    0, 0, 0, 8
]);


expectEqual(cellsToRows(directions.RIGHT,
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

expectEqual(cellsToRows(directions.LEFT,
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

expectEqual(cellsToRows(directions.DOWN,
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

expectEqual(cellsToRows(directions.UP,
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


