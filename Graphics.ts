
var createjs;

module Graphics {

    export class TetrisRoot {
        
        constructor() {
        } 

        bind(char, callback) {
        }
    }

    export class TetrisTimer {

        constructor() {
            createjs.Ticker.setInterval(25);
            createjs.Ticker.setFPS(40);
            createjs.Ticker.useRAF = true;
        }

        static pause() {
            var paused = !createjs.Ticker.getPaused();
            createjs.Ticker.setPaused(paused);
        }

        setCallback(callback) {
            createjs.Ticker.addListener(callback);
            //createjs.Ticker.addEventListener("tick", callback);
        }
    } 

    export class TetrisCanvas {

        public stage; 
        constructor() {
            this.stage = new createjs.Stage("tetris");
        }

        place(height, width, x, y) {
        }

        addChild(ele: any) {
            this.stage.addChild(ele);
        }

        update() {
            this.stage.update();
        }

        unplace() {
        }

        remove() {
        }
    }

    export class TetrisRect {

        private rect;

        constructor(canvas: TetrisCanvas, x, y, w, h, color) {
            this.rect = new createjs.Shape();
            this.rect.graphics.beginFill(color).drawRect(x, y, w, h);
            canvas.addChild(this.rect);
            canvas.update();
        }

        move(dx: number, dy: number) {
            console.log(this);
            
            this.rect.x += dx;
            this.rect.y += dy;
        }
    } 
}


module Game {

    export class Piece {
        
        board: Board;
        all_rotations;
        rotation_index;
        color;
        base_position = [5,0];
        moved = true;
        
        constructor(pointArray, board : Board) {
            this.all_rotations = pointArray;
            this.board = board;
            this.rotation_index = 0; //TODO:randomize
            this.color = "Red"; //TODO: get random from All Colors array
            this.base_position = [5,0];
            this.moved = true;
        }

        current_rotation() {
            return this.all_rotations[this.rotation_index];
        }

        dropByOne() {
            this.moved = this.move(0, 1, 0);
        }

        move(deltaX, deltaY, deltaRotation) {
            this.moved = true;
            var potential = this.all_rotations[(this.rotation_index + deltaRotation) % this.all_rotations.length];

            potential.forEach(function(posns) {
                if (this.board.emptyAt([posns[0] + deltaX + this.base_position[0],
                                    posns[1] + deltaY + this.base_position[1]])) {
                    this.moved = false;
                }
            });

            if (this.moved) {
                this.base_position[0] += deltaX;
                this.base_position[1] += deltaY;
                this.rotation_index = (this.rotation_index + deltaRotation) % this.all_rotations.length;
            }

            return this.moved;
        }

        static rotations (point_array) {

        }
        
        static next_piece(board: Board) {
            return new Piece(this.All_Pieces[0], board);
        }

        static All_Pieces = [[[[0, 0], [1, 0], [0, 1], [1, 1]]]];

        static AllColors = ['DarkGreen', 'dark blue', 'dark red', 'gold2', 'Purple3', 
               'OrangeRed2', 'LightSkyBlue'];
    }

    export class Board {

        game: Tetris;
        grid: any;
        currentBlock: Piece;
        current_pos: any;

        blockSize = 15;
        numColumns = 10;
        numRows = 27;
        score = 0;
        delay = 500;

        constructor(game: Tetris) {
            this.game = game;
            //this.grid = _.map(_.range(this.numRows), function(){return _.range(this.numColumns)});

            this.grid = new Array(this.numRows);

            for (var i = 0; i < this.numRows; i++) {
                this.grid[i] = new Array(this.numColumns);
            }

            this.currentBlock = Piece.next_piece(this);
        }

        emptyAt (point) {

        }

        run() {
            var ran = this.currentBlock.dropByOne();

            if (!ran) {
                //this.storeCurrent();
            
            }
        
        }

        storeCurrent() {
        }

        draw() {
            this.current_pos = this.game.draw_piece(this.currentBlock, this.current_pos);
        }
    }

    export class Tetris {

        root: Graphics.TetrisRoot;
        ticker: Graphics.TetrisTimer;
        canvas: Graphics.TetrisCanvas;
        rect: Graphics.TetrisRect;
        board: Board;

        isRunning: bool;

        constructor() {
            this.root = new Graphics.TetrisRoot();
            this.ticker = new Graphics.TetrisTimer();
            this.canvas = new Graphics.TetrisCanvas();
            this.rect = new Graphics.TetrisRect(this.canvas, 2, 2, 25, 25, "red");
            this.ticker.setCallback(this);
            this.board = new Board(this);
            this.isRunning = true;
            //createjs.Ticker.addListener(this);
            //createjs.Ticker.addEventListener("tick", this.tick);
        }
        
        tick() {
            if (this.isRunning) {
                this.rect.move(0, 3);
                this.canvas.update();
            }
        }

        draw_piece(piece: Piece, old) {
            old = null;
            var size = this.board.blockSize;
            var blocks = piece.current_rotation();
            var start = piece.base_position;
        
        }
    }
}

var g = new Game.Tetris();
