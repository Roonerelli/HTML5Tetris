
var createjs;
var _;
var Hammer;

module Graphics {

    export class TetrisRoot {
        
        static keyBindings = {};
        private gameCanvas;

        constructor(canvasId: string) {
            this.gameCanvas = document.getElementById(canvasId);

            //document.ontouchmove = function(event){
            //    event.preventDefault();
            //}

            document.body.onkeydown = function (event) {
                event = event || window.event;
                var keycode = event.charCode || event.keyCode;

                var action = TetrisRoot.keyBindings['' + keycode];

                if (action != undefined) {
                    action();
                }
            }
        }

        bindKey(keyChar : number, action : Function) {
            TetrisRoot.keyBindings[keyChar] = action;
        }

        bindTouch(eventName : string, action : Function) {
            Hammer(this.gameCanvas).on(eventName, action);            
        }
    }

    export class Ticker {

        constructor(interval: number, fps: number) {
            createjs.Ticker.setInterval(interval);
            createjs.Ticker.setFPS(fps);
            createjs.Ticker.useRAF = true;
        }

        static pause() {
            var isPaused = !createjs.Ticker.getPaused();
            createjs.Ticker.setPaused(isPaused);
        }

        setCallback(callback) {
            createjs.Ticker.addListener(callback);
            //createjs.Ticker.addEventListener("tick", callback);
        }
    } 

    export class Canvas {

        public stage; 
        constructor(blockSize : number, numColumns : number, numRows : number) {
            this.stage = new createjs.Stage("tetris");
            
            this.drawGrid(blockSize, numColumns, numRows);
        }

        addChild(ele: any) {
            this.stage.addChild(ele);
        }

        removeChild(ele: Square) {
            this.stage.removeChild(ele);
        }

        update() {
            this.stage.update();
        }
        
        remove() {
        }

        drawGrid(blockSize : number, numColumns : number, numRows : number) {
            for (var i = 1; i <= numColumns; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(1);

                g.moveTo(i * blockSize,0);
                g.lineTo(i * blockSize, numRows * blockSize);
                var s = new createjs.Shape(g);
                this.stage.addChild(s);
            }

            for (var i = 0; i < numRows; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(1);

                g.moveTo(0, i * blockSize);
                g.lineTo(numColumns * blockSize, i * blockSize);
                var s = new createjs.Shape(g);
                this.stage.addChild(s);
            }
        }
    }

    export class Square {

        public rect;
        private canvas : Canvas;

        constructor(canvas: Canvas, x, y, w, h, color) {
            
            this.rect = new createjs.Shape();
            this.rect.graphics.beginStroke("#000");
            this.rect.graphics.setStrokeStyle(1);
            this.rect.snapToPixel = true;
            this.rect.graphics.beginFill(color).drawRect(x, y, w, h);

            this.canvas = canvas;
            this.canvas.addChild(this.rect);
            this.canvas.update();
        }

        move(dx: number, dy: number) {
            this.rect.x += dx;
            this.rect.y += dy;
        }

        remove() {
            this.canvas.removeChild(this.rect);
        }
    } 

    export class Label {

        private ele;

        constructor(elementId: string) {
            this.ele = document.getElementById(elementId);
        }

        setText(text :string) {
            this.ele.innerHTML  = text;
        }
    }

    export class Button {

        private ele;

        constructor(elementId: string, action : Function) {
            this.ele = document.getElementById(elementId);
            this.ele.onclick = action;
        }
    }
}


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
            this.rotationIndex = rotIndx; //TODO:randomize
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
            this.moved = true;
            var potential = this.allRotations[(this.rotationIndex + deltaRotation) % this.allRotations.length];

            for (var index = 0; index < potential.length; ++index) {
                var posns = potential[index];
                if(!this.board.emptyAt([
                    posns[0] + deltaX + this.basePosition[0], 
                    posns[1] + deltaY + this.basePosition[1]])) {
                    this.moved = false;
                }
            }

            if (this.moved) {
                this.basePosition[0] += deltaX;
                this.basePosition[1] += deltaY;
                this.rotationIndex = (this.rotationIndex + deltaRotation) % this.allRotations.length;
            }

            return this.moved;
        }

        static rotations (pointArray) {
            var rotate1 = _.map(pointArray, (point) => { return [-point[1], point[0]]; })
            var rotate2 = _.map(pointArray, (point) => { return [-point[0], point[1]]; })
            var rotate3 = _.map(pointArray, (point) => { return [point[1], -point[0]]; })

            return [pointArray, rotate1, rotate2, rotate3];
        }
        
        static nextPiece(board: Board) {            
            var indx = Math.floor(Math.random() * this.AllPieces.length);
            return new Piece(this.AllPieces[indx], board);
        }

        static AllPieces = [[[[0, 0], [1, 0], [0, 1], [1, 1]]], //# square (only needs one)
            Piece.rotations([[0, 0], [-1, 0], [1, 0], [0, -1]]), // T
            [[[0, 0], [-1, 0], [1, 0], [2, 0]],     // long
                [[0, 0], [0, -1], [0, 1], [0, 2]]],
            Piece.rotations([[0, 0], [0, -1], [0, 1], [1, 1]]), // L
            Piece.rotations([[0, 0], [0, -1], [0, 1], [-1, 1]]), // inverted L
            Piece.rotations([[0, 0], [-1, 0], [0, -1], [1, -1]]), // S
            Piece.rotations([[0, 0], [1, 0], [0, -1], [-1, -1]])]; // Z

        static AllColors = ['Aqua', 'Blue', 'red', 'DarkViolet', 'Yellow', 'Orange', 'Green'];
    }

    export class Board {

        grid: any;
        currentBlock: Piece;
        score = 0;
        game: Tetris;

        blockSize = 20;
        numColumns = 10;
        numRows = 25;
        currentPos: any;
        
        constructor(game: Tetris) {
            //this.grid = _.map(_.range(this.numRows), function(){return _.range(this.numColumns)});

            this.grid = new Array(this.numRows);

            for (var i = 0; i < this.numRows; i++) {
                this.grid[i] = new Array(this.numColumns);
            }

            this.currentBlock = Piece.nextPiece(this);
            this.game = game;
        }

        gameOver() {
            return _.some(this.grid[1], (x) => {return x != undefined;});

            /*
            var anyInTopRow = false;
            for(var g = 0; g < this.grid[1].length; g++) {
                if(this.grid[1][g] != undefined) {
                    anyInTopRow = true;
                    break;
                }
            }
            */
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
        rect:       Graphics.Square;
        pauseBtn:   Graphics.Button;
        newGameBtn: Graphics.Button;
        board:      Board;
        isRunning:  bool;
        score :     Graphics.Label;
        options:    any;

        constructor(options) {
            this.options = options;
            this.root = new Graphics.TetrisRoot('tetris');
            this.ticker = new Graphics.Ticker(options.tickerInterval, options.fps);
            this.ticker.setCallback(this);
            this.isRunning = true;
            this.setBoard();
            this.keyBindings();
            this.touchBindings();
            this.buttonBindings();
            this.controls();
        }

        newGame() {
            this.setBoard();
            this.score.setText(this.board.score.toString());
            this.isRunning = true;
        }

        setBoard() {
            this.canvas = new Graphics.Canvas(this.options.blockSize, this.options.numColumns, this.options.numRows);
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
        }

        controls() {
            this.score = new Graphics.Label('scoreboard');
        }

        tick() {
            if (this.isRunning && !this.board.gameOver()) {
                this.board.run();
            }
        }

        pause() {
            Graphics.Ticker.pause();
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
                                    start[0] * size + block[0]*size + 3,
                                    start[1] * size + block[1]*size,
                                    this.board.blockSize, this.board.blockSize, piece.color));
            }

            return results;
        }

        updateScore() {
            this.score.setText(this.board.score.toString());
        }
    }
}

var options = {
    blockSize : 20,
    numColumns : 10,
    numRows : 25,
    fps : 2,
    tickerInterval : 200
};

var g = new Game.Tetris(options);
