module Game {

    export class Piece {
        
        allRotations;
        rotationIndex;
        color;
        basePosition = [5, 0];
        board: Board;
        moved = true;
        
        constructor(pointArray, board : Board) {
            this.allRotations = pointArray;
            var rotIndx = Math.floor(Math.random() * this.allRotations.length);
            this.rotationIndex = rotIndx;
            var indx = Math.floor(Math.random() * Piece.AllColors.length);
            this.color = Piece.AllColors[indx]; 
            this.basePosition = [5, 0];
            this.board = board;
            this.moved = true;
        }

        currentRotation() {
            return this.allRotations[this.rotationIndex];
        }

        dropByOne() {
            this.moved = this.move(0, 1, 0);
            return this.moved;
        }

        move(deltaX, deltaY, deltaRotation) {
            var moved = true;
            var potential = this.allRotations[(this.rotationIndex + deltaRotation) % this.allRotations.length];

            for (var index = 0; index < potential.length; ++index) {
                var posns = potential[index];
                if(!this.board.emptyAt([
                    posns[0] + deltaX + this.basePosition[0], 
                    posns[1] + deltaY + this.basePosition[1]])) {
                    moved = false;
                }
            }

            if (moved) {
                this.basePosition[0] += deltaX;
                this.basePosition[1] += deltaY;
                this.rotationIndex = (this.rotationIndex + deltaRotation) % this.allRotations.length;
            }

            return moved;
        }        
        
        static nextPiece(board: Board) {            
            var indx = Math.floor(Math.random() * this.AllPieces.length);
            return new Piece(this.AllPieces[indx], board);
        }

        static AllPieces = 
        [
            [
             [[0, 0], [1, 0], [0, 1], [1, 1]]
            ], // square 
            [
             [[0, 0], [-1, 0], [1, 0], [2, 0]],
             [[0, 0],[0, -1], [0, 1], [0, 2]]
            ], // long
            [
             [[0, 0], [-1, 0], [1, 0], [0, -1]], 
             [[0, 0], [1, 0], [0, 1], [0, -1]],  
             [[0, 0], [-1, 0], [1, 0], [0, 1]],  
             [[0, 0], [-1, 0], [0, 1], [0, -1]], 
            ], // T
            [
             [[0, 0], [0, -1], [0, 1], [1, 1]],   
             [[0, 0], [-1, 0], [1, 0], [-1, 1]],  
             [[0, 0], [0, 1], [0, -1], [-1, -1]], 
             [[0, 0], [-1, 0], [1, 0], [1, -1]],  
            ], //L
            [
             [[0, 0], [-1, 0], [0, -1], [1, -1]],
             [[0, 0], [0, 1], [-1, 0], [-1, -1]],
             [[0, 0], [0, 1], [-1, 1], [1, 0]],
             [[0, 0], [1, 0], [1, 1], [0, -1]]
            ], // S
            [
             [[0, 0], [1, 0], [0, -1], [-1, -1]],
             [[0, 0], [-1, 0], [-1, 1], [0, -1]],
             [[0, 0], [0, 1], [1, 1], [-1, 0]],
             [[0, 0], [0, 1], [1, 0], [1, -1]]
            ] // Z
        ]; 

        static AllColors = ['Aqua', 'Blue', 'red', 'DarkViolet', 'Yellow', 'Orange', 'Green'];
    }

    export class Board {

        grid: any;
        currentBlock: Piece;
        score = 0;
        game: Tetris;

        blockSize;
        numColumns;
        numRows;
        currentPos: any;
        
        constructor(game: Tetris) {
            this.blockSize = game.options.blockSize;
            this.numColumns = game.options.numColumns;
            this.numRows = game.options.numRows;
            //this.grid = _.map(_.range(this.numRows), function(){return _.range(this.numColumns)});

            this.grid = new Array(this.numRows);

            for (var i = 0; i < this.numRows; i++) {
                this.grid[i] = new Array(this.numColumns);
            }

            this.currentBlock = Piece.nextPiece(this);
            this.game = game;
        }

        gameOver() {
            //return _.some(this.grid[1], (x) => {return x != undefined;});
            
            var anyInTopRow = false;
            for(var g = 0; g < this.grid[1].length; g++) {
                if(this.grid[1][g] != undefined) {
                    anyInTopRow = true;
                    break;
                }
            }
            return anyInTopRow;
        }

        run() {
            var ran = this.currentBlock.dropByOne();

            if (!ran) {
                this.storeCurrent();
                
                if (!this.gameOver()) {
                    this.nextPiece();                    
                }
            }

            this.score += 1;
            this.game.updateScore();
            this.draw();
        }

        move_left() {
            this.move(-1, 0, 0);
        }

        move_right() {
            this.move(1, 0, 0);
        }

        rotate_clockwise() {
            this.move(0, 0, 1);
        }

        rotate_counter_clockwise() {
            this.move(0, 0, -1);
        }

        move(x, y, rot) {
            if (!this.gameOver() && this.game.isRunning) {
                this.currentBlock.move(x, y, rot);
            }
            this.draw();
        }

        drop_all_the_way() {
            if (this.game.isRunning) {
                var ran = this.currentBlock.dropByOne();

                while (ran) {

                    for (var i = 0; i < this.currentPos.length; i++) {
                        var block = this.currentPos[i];
                        block.remove();
                    }

                    //_.each(this.currentPos, function (block) { block.remove; })
                    this.score += 1;
                    ran = this.currentBlock.dropByOne();
                }
                this.draw();
                this.storeCurrent();
                if (!this.gameOver()) {
                    this.nextPiece();
                }

                this.game.updateScore();

                this.draw();
            }
        }

        nextPiece() {
            this.currentBlock = Piece.nextPiece(this);
            this.currentPos = null;
        }

        storeCurrent() {
            var locations = this.currentBlock.currentRotation();
            var displacements = this.currentBlock.basePosition

            for (var i = 0; i < 4; i++) {
                var current = locations[i];
                this.grid[current[1] + displacements[1]][current[0] + displacements[0]] = this.currentPos[i];
            }
            
            this.removeFilled();
        }

        emptyAt(point) {
            if (!(point[0] >= 0 && point[0] < this.numColumns)) {
                return false;
            }
            else if (point[1] < 1) {
                return true;
            }
            else if (point[1] >= this.numRows) {
                return false;
            }

            return this.grid[point[1]][point[0]] == null;
        }

        removeFilled() {
            for (var i = 2; i < this.grid.length; i++) {
                var row = this.grid.slice(i);

                var allFull = true;

                for (var g = 0; g < this.grid[i].length; g++ ) {
                    if (this.grid[i][g] == undefined) {
                        allFull = false;
                        break;
                    }
                }

                //TODO: why is _.every not working?
                //if (_.every(this.grid[i], function(x) {console.log(x); return x != undefined })) {
                if (allFull) {
                    for (var j = 0; j < this.numColumns; j++) {
                        this.grid[i][j].remove();
                        this.grid[i][j] = undefined;
                    }

                    for (var k = this.grid.length - i + 1; k <= this.grid.length; k++) {

                        var rects = this.grid[this.grid.length - k];

                        for(var l = 0; l < rects.length; l++) {
                            var rect  = rects[l];
                            if (rect) {
                                rect.move(0, this.blockSize);
                            }
                        }

                        this.grid[this.grid.length - k + 1] = this.grid[this.grid.length - k].slice();
                    }

                    this.grid[0] =  new Array(this.numColumns);
                    this.score += 10;
                }
            }
        }

        draw() {
            this.currentPos = this.game.drawPiece(this.currentBlock, this.currentPos);
        }
    }

    export class Tetris {

        root:       Graphics.TetrisRoot;
        ticker:     Graphics.Ticker;
        canvas:     Graphics.Canvas;
        board:      Board;
        pauseBtn:   Graphics.Button;
        newGameBtn: Graphics.Button;
        helpBtn:    Graphics.Button;
        score:      Graphics.Label;
        hiScore:    Graphics.Label;
        isRunning:  boolean;
        options:    any;
        ticks:      number;

        constructor(options) {
            this.options = options;
            this.root = new Graphics.TetrisRoot('tetris', options.blockSize, options.numColumns, options.numRows);
            this.ticker = new Graphics.Ticker(options.tickerInterval, options.fps);
            this.ticker.setCallback(this);
            this.setBoard();
            this.keyBindings();
            this.touchBindings();
            this.buttonBindings();
            this.scores();
            this.isRunning = false; 
        }

        newGame() {
            this.setBoard();
            this.ticks = 0;
            this.ticker.setFPS(this.options.fps);
            this.ticker.unpause();
            this.isRunning = true;
            this.newGameBtn.blur();
            //this.root.playAudio(); 
        }

        setBoard() {
            this.canvas = new Graphics.Canvas(this.options.blockSize, this.options.numColumns, this.options.numRows);
            this.canvas.update();
            this.board = new Board(this);
        }
        
        keyBindings() {
            this.root.bindKey(37, () => { this.board.move_left(); })
            this.root.bindKey(39, () => { this.board.move_right(); })
            this.root.bindKey(38, () => { this.board.rotate_clockwise(); })
            this.root.bindKey(40, () => { this.board.rotate_counter_clockwise(); })            
            this.root.bindKey(32, () => { this.board.drop_all_the_way(); })
        }

        touchBindings() {
            this.root.bindTouch("doubletap", () => {this.board.drop_all_the_way();})
            this.root.bindTouch("swipeleft", () => {this.board.move_left();})
            this.root.bindTouch("swiperight", () => {this.board.move_right();})
            this.root.bindTouch("swipeup", () => {this.board.rotate_clockwise();})
            this.root.bindTouch("swipedown", () => {this.board.rotate_counter_clockwise();})
        }

        buttonBindings() {
            this.pauseBtn = new Graphics.Button('pause', () => {this.pause();});
            this.newGameBtn = new Graphics.Button('newGame', () => {this.newGame();});
            this.helpBtn = new Graphics.Button('help', () => {this.showHelp();});
            this.helpBtn = new Graphics.Button('about', () => {window.location.href = 'https://github.com/Roonerelli/HTML5Tetris';});
        }

        scores() {
            this.score = new Graphics.Label('currentScore');
            this.hiScore = new Graphics.Label('hiScore');
            var hi = localStorage.getItem('hiScore');
            this.hiScore.setText(hi || '0');
            this.score.setText('0');
        }

        tick() {
            if (this.isRunning) {
                if(this.board.gameOver()) {
                    this.gameOver();
                }
                else {
                    this.speedUp();
                    this.board.run();
                }
            }
        }

        pause() {
            Graphics.Ticker.pause();
            this.isRunning = !this.isRunning;
            //this.root.pauseAudio();
        }

        gameOver() {
            this.isRunning = false;
            var content =  this.setHiScore() ? 'hiScoreMsg' : 'gameOverMsg';
            //this.root.stopAudio();

            picoModal({
                content: document.getElementById(content).innerHTML,
                overlayStyles: {
                    backgroundColor: "#ccc",
                    opacity: 0.55
                }
            });
        }

        speedUp() {
            this.ticks++;

            if (this.ticks%250 === 0) {
                this.ticker.incrementFPS(0.1);
            }
        }

        showHelp() {
            var self = this;

            if (this.isRunning) {
                this.pause();
            }
            
            var modal = picoModal({
                content: document.getElementById('instructions').innerHTML,
                overlayStyles: {
                    backgroundColor: "#ddd",
                    opacity: 0.75
                }
            });

            modal.onClose(function () {
                self.pause();
            });
        }

        setHiScore() {
            var hi = localStorage.getItem('hiScore');
            hi = hi || 0;

            if (this.board.score > parseInt(hi)) {
                localStorage.setItem('hiScore', this.board.score.toString());
                this.hiScore.setText(this.board.score.toString());        
                return true;
            }
            return false;
        }

        drawPiece(piece: Piece, old) {
            if (old != null && piece.moved) {
                for (var i = 0; i < old.length; i++) {
                    var o = old[i];
                    o.remove();
                }
            }
            
            var size = this.board.blockSize;
            var blocks = piece.currentRotation();
            var start = piece.basePosition;

            var results = [];

            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];

                results.push(new Graphics.Square(this.canvas, 
                                    start[0] * size + block[0]*size,
                                    start[1] * size + block[1]*size,
                                    this.board.blockSize, piece.color));
            }

            return results;
        }

        updateScore() {
            this.score.setText(this.board.score.toString());
        }
    }
}
