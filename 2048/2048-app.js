
$(function(){

    // Game UI
    var updateCells = (function(){
        var $cells = $(".cell"),
            allClasses = "v2 v4 v8 v16 v32 v64 v128 v256 v512 v1024 v2048",
            classFor = function(val){
                return val ? ("v" + val) : "";
            };

        return each(function(val, idx){
            $($cells[idx]).removeClass(allClasses).addClass(classFor(val));
        });

    }());

    var updateUI = (function(){
        var $gameOver = $(".game-over");
        var $gameWon = $(".game-won");
        var $solve = $(".solve");

        return function(){
            updateCells(this.game.cells);
            this.game.isGameOver() ? $gameOver.show() : $gameOver.hide();
            this.game.isGameWon() ? $gameWon.show() : $gameWon.hide();

            $solve.text(this.solveTimeout ? "STOP" : "SOLVE")
        };

    }());

    var manager = new GameManager(updateUI);

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
});


